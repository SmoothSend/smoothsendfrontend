"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import {
  Aptos,
  AptosConfig,
  Network,
} from "@aptos-labs/ts-sdk";
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Send,
  User,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "../lib/api-service";
import { TransactionProgress } from "./transaction-progress";
import {
  ValidationHelpers,
  handleContractError,
} from "../lib/contract-errors";
import { RELAYER_ADDRESS } from "../lib/constants";

export function TransferForm() {
  const { account, signTransaction } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const { toast } = useToast();

  const MAX_TRANSFER_LIMIT = 10; // 10 USDC maximum transfer limit

  // Enhanced validation with v2 security features
  const validateTransfer = () => {
    const errors: string[] = [];

    // Basic validations
    if (!ValidationHelpers.validateAddress(recipient)) {
      errors.push("Invalid recipient address format");
    }

    if (ValidationHelpers.isZeroAmount(amount)) {
      errors.push("Amount must be greater than zero");
    }

    // v2 Security validations
    if (
      account?.address &&
      ValidationHelpers.isSelfTransfer(
        account.address.toString(),
        recipient,
        RELAYER_ADDRESS
      )
    ) {
      errors.push("Cannot transfer to yourself or the relayer");
    }

    // Check overflow risk
    const amountInMicroUSDC = (parseFloat(amount || "0") * 1_000_000).toString();
    const estimatedFee = "1000"; // Rough estimate, real fee comes from quote
    if (ValidationHelpers.isOverflowRisk(amountInMicroUSDC, estimatedFee)) {
      errors.push("Amount is too large and may cause overflow");
    }

    return errors;
  };

  const validationErrors = validateTransfer();
  const isValidAddress = ValidationHelpers.validateAddress(recipient);
  const amountNum = parseFloat(amount) || 0;
  const isValidAmount =
    amountNum > 0 &&
    amountNum <= Math.min(balance, MAX_TRANSFER_LIMIT) &&
    validationErrors.length === 0;

  // Fetch balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account?.address) return;

      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/api/v1/relayer/balance/${account.address.toString()}`
        );
        if (response.ok) {
          const balanceData = await response.json();
          if (balanceData.success) {
            setBalance(balanceData.balance);
          }
        }
      } catch (err: unknown) {
        const error = err as Error;
        console.error(error);
        // Use demo balance for testnet
        setBalance(2868.82);
      }
    };

    fetchBalance();
  }, [account?.address]);

  // Note: We don't need to fetch quotes upfront since the gasless endpoint handles it internally
  // useEffect removed for simplified gasless flow

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || !account?.address) return;

    setIsSubmitting(true);
    setCurrentStep(0);
    setShowSuccess(false);

    try {
      // Step 1: Enhanced validation with v2 security features
      const validationErrors = validateTransfer();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      const amountNum = parseFloat(amount);
      if (amountNum <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      if (amountNum > MAX_TRANSFER_LIMIT) {
        throw new Error(
          `Amount cannot exceed ${MAX_TRANSFER_LIMIT} USDC per transaction`
        );
      }
      if (amountNum > balance) {
        throw new Error("Insufficient balance");
      }

      setCurrentStep(1);

      // Step 2: Initialize Aptos client and build transaction
      const config = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(config);
      const coinType =
        process.env.NEXT_PUBLIC_USDC_CONTRACT ||
        "0x3c27315fb69ba6e4b960f1507d1cefcc9a4247869f26a8d59d6b7869d23782c::test_coins::USDC";
      const relayerAddress =
        process.env.NEXT_PUBLIC_RELAYER_ADDRESS ||
        "0x5dfe1626d0397e882d80267b614cae3ebdae56a80809f3ddb7ada9d58366060a";
      const contractAddress =
        process.env.NEXT_PUBLIC_SMOOTHSEND_CONTRACT ||
        "0x6d88ee2fde204e756874e13f5d5eddebd50725805c0a332ade87d1ef03f9148b";

      setCurrentStep(2);

      // Step 3: Get dynamic relayer fee from backend
      const amountInMicroUSDC = (amountNum * 1_000_000).toString();
      const quoteResponse = await apiService.getGaslessQuote({
        fromAddress: account.address.toString(),
        toAddress: recipient,
        amount: amountInMicroUSDC,
        coinType: coinType,
      });

      if (!quoteResponse.success || !quoteResponse.quote) {
        throw new Error("Failed to get fee quote from backend");
      }

      const dynamicRelayerFee = quoteResponse.quote.relayerFee;
      console.log(
        `Using dynamic relayer fee: ${dynamicRelayerFee} micro-USDC (${(
          parseInt(dynamicRelayerFee) / 1e6
        ).toFixed(6)} USDC)`
      );

      setCurrentStep(3);

      // Step 4: Build the transaction using SmoothSend contract with dynamic fee
      const rawTransaction = await aptos.transaction.build.simple({
        sender: account.address,
        withFeePayer: true, // Important: This allows the relayer to pay gas
        data: {
          function: `${contractAddress}::smoothsend::send_with_fee`,
          typeArguments: [coinType],
          functionArguments: [
            relayerAddress,
            recipient,
            amountInMicroUSDC, // Amount in micro-USDC
            dynamicRelayerFee, // Dynamic relayer fee from backend
          ],
        },
        options: {
          maxGasAmount: 5000,
          gasUnitPrice: 100,
        },
      });

      setCurrentStep(4);

      // Step 5: Sign the transaction with user's wallet
      const response = await signTransaction({
        transactionOrPayload: rawTransaction,
      });

      if (!response) {
        throw new Error("Failed to sign transaction");
      }

      setCurrentStep(5);

      // Step 6: Serialize for backend submission
      const transactionBytes = rawTransaction.bcsToBytes();
      const authenticatorBytes = response.authenticator.bcsToBytes();

      // Step 7: Submit to gasless relayer
      const resultData = await apiService.submitGaslessWithWallet({
        transactionBytes: Array.from(transactionBytes),
        authenticatorBytes: Array.from(authenticatorBytes),
        functionName: "send_with_fee",
      });

      // Step 8: Process the result
      setCurrentStep(6);

      if (resultData.success && resultData.txnHash) {
        setCurrentStep(7); // Final confirmation step
        setTransactionHash(resultData.txnHash);
        setShowSuccess(true);

        toast({
          title: "Gasless Transaction Successful! 🎉",
          description: `Sent ${amount} USDC with sponsored gas fees!`,
        });

        // Reset form
        setRecipient("");
        setAmount("");
      } else {
        throw new Error(resultData.error || "Transaction failed");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Transaction error:", error);

      // Enhanced error handling for v2 contract errors
      const errorMessage =
        handleContractError(error) || error.message || "Something went wrong";

      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setCurrentStep(0);
    }
  };

  const handleMaxClick = async () => {
    if (!account?.address) return;

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/v1/relayer/balance/${account.address.toString()}`
      );
      if (response.ok) {
        const balanceData = await response.json();
        if (balanceData.success) {
          setBalance(balanceData.balance);
          // Set amount to minimum of balance and max transfer limit
          const maxAmount = Math.min(balanceData.balance, MAX_TRANSFER_LIMIT);
          setAmount(maxAmount.toString());
        }
      } else {
        throw new Error("Failed to fetch balance");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      // Use demo values for testnet
      setBalance(2868.82);
      setAmount(MAX_TRANSFER_LIMIT.toString());
    }
  };

  const steps = [
    "Validating transaction",
    "Building SmoothSend transaction",
    "Signing with wallet",
    "Serializing transaction",
    "Submitting to relayer",
    "Processing on blockchain",
    "Transaction confirmed"
  ]

  if (showSuccess) {
    return (
      <Card className="p-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-green-500/20 rounded-3xl text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gasless Transaction Successful! 🎉</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Your USDC has been sent with sponsored gas fees using our relayer!</p>
        {transactionHash && (
          <Button
            onClick={() =>
              window.open(`https://explorer.aptoslabs.com/txn/${transactionHash}?network=testnet`, "_blank")
            }
            variant="outline"
            className="mb-4"
          >
            View on Explorer
          </Button>
        )}
        <Button onClick={() => setShowSuccess(false)} className="bg-green-500 hover:bg-green-600 text-white rounded-xl">
          Send Another
        </Button>
      </Card>
    )
  }

  if (isSubmitting) {
    return <TransactionProgress currentStep={currentStep} steps={steps} />
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="recipient" className="text-gray-900 dark:text-gray-200 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Recipient Address</span>
          </Label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 rounded-lg h-12"
            required
          />
          {!recipient && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-3 mt-2">
              <p className="text-xs text-blue-600 dark:text-blue-300 mb-2">
                💡 <strong>Need a test address?</strong> Try this one:
              </p>
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-md p-2">
                <code className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1 mr-2">
                  0x5d39e7e11ebab92bcf930f3723c2498eb7accea57fce3c064ab1dba2df5ff29a
                </code>
                <Button
                  type="button"
                  onClick={() => {
                    setRecipient('0x5d39e7e11ebab92bcf930f3723c2498eb7accea57fce3c064ab1dba2df5ff29a')
                    navigator.clipboard.writeText('0x5d39e7e11ebab92bcf930f3723c2498eb7accea57fce3c064ab1dba2df5ff29a')
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                >
                  Use This
                </Button>
              </div>
            </div>
          )}
          {recipient && !isValidAddress && (
            <p className="text-red-500 dark:text-red-400 text-sm flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>Invalid address format</span>
            </p>
          )}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3">
              {validationErrors.map((error, index) => (
                <p key={index} className="text-red-600 dark:text-red-400 text-sm flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="text-gray-900 dark:text-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Amount (USDC)</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Max: {Math.min(balance, MAX_TRANSFER_LIMIT).toFixed(6)} USDC
            </div>
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 rounded-lg h-12 pr-16"
              min="0.000001"
              max={MAX_TRANSFER_LIMIT}
              step="0.000001"
              required
            />
            <Button
              type="button"
              onClick={handleMaxClick}
              className="absolute right-2 top-2 h-8 px-3 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              MAX
            </Button>
          </div>
          {amount && amountNum > 0 && (
            <div className="text-xs space-y-1">
              {amountNum > MAX_TRANSFER_LIMIT && (
                <p className="text-red-500 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Maximum transfer limit is {MAX_TRANSFER_LIMIT} USDC</span>
                </p>
              )}
              {amountNum > balance && (
                <p className="text-red-500 dark:text-red-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Insufficient balance (Available: {balance.toFixed(6)} USDC)</span>
                </p>
              )}
              {amountNum > 0 && amountNum <= Math.min(balance, MAX_TRANSFER_LIMIT) && (
                <p className="text-green-500 dark:text-green-400 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Valid amount</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">APT Gas Fee</span>
            <span className="text-green-500 dark:text-green-400 font-medium">FREE (Relayer pays)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Relayer Fee</span>
            <span className="text-orange-500 dark:text-orange-400">
              ~0.01 USDC (10% markup)
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
            <span className="text-gray-900 dark:text-gray-100 font-medium">You Pay</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {amount || "0"} USDC + fee
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Exact fee calculated at transaction time
          </p>
        </div>

        <Button
          type="submit"
          disabled={!isValidAddress || !isValidAmount || isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-3 rounded-lg h-12 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Gaslessly
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
