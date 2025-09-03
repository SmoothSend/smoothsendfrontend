export interface Transaction {
  hash: string;
  type: "send" | "receive";
  amount: number;
  recipient: string;
  sender: string;
  status: "pending" | "success" | "failed";
  timestamp: string;
  blockHeight?: number;
}
