# 🚀 SmoothSend Frontend

Modern Next.js frontend for gasless USDC transactions on Aptos blockchain.

**✅ LIVE ON TESTNET!**

🌐 **Live Demo**: [https://smoothsend-frontend.vercel.app](https://smoothsend-frontend.vercel.app)

## ✨ Features

- **🔗 Multi-Wallet Support**: Petra, Martian, Pontem, and Nightly wallets
- **⛽ Zero Gas Fees**: Send USDC without holding APT (pay fees in USDC)
- **💨 Real-time Quotes**: Instant gasless transaction quotes with transparent fees
- **📊 Live Dashboard**: Monitor relayer status and transaction history
- **🎨 Modern UI**: Beautiful design with Tailwind CSS and Shadcn/ui
- **🔒 Type Safe**: Full TypeScript with Zod validation
- **📱 Responsive**: Works on desktop and mobile
- **⚡ Production Ready**: Deployed on Vercel with live backend

## 🏗️ Architecture

```
Frontend (Next.js) → Backend API → Gasless Relayer → Aptos Blockchain
      ↓                   ↓              ↓              ↓
  Vercel/Local    Production API   SmoothSend    Testnet
```

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/SmoothSend/smoothsendfrontend.git
cd smoothsendfrontend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

## 🔧 Environment Variables

Create `.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_URL=your_backend_url

# Relayer Configuration
NEXT_PUBLIC_RELAYER_ADDRESS=your_relayer_address
NEXT_PUBLIC_APTOS_NETWORK=testnet

# Contract Addresses (testnet)
NEXT_PUBLIC_USDC_CONTRACT=your_usdc_contract_address
NEXT_PUBLIC_SMOOTHSEND_CONTRACT=your_smoothsend_contract_address

# Optional
NEXT_PUBLIC_SHOW_DEBUG=false
```

See `.env.example` for complete configuration template.

## 🎯 How It Works

### 1. Connect Wallet
- Support for 4+ Aptos wallets
- Automatic wallet detection
- Persistent connection

### 2. Gasless Transactions
- Enter recipient & amount
- Get instant quote with USDC fee
- Approve transaction (zero APT gas!)
- Relayer handles gas payment

### 3. Fee Structure
- User pays small USDC fee (~10% markup)
- Relayer pays APT gas fees
- Sustainable and transparent

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Shadcn/ui
- **Blockchain**: Aptos TypeScript SDK
- **Wallets**: Aptos Wallet Adapter
- **Validation**: Zod schemas
- **State**: React Context + hooks
- **Deployment**: Vercel

## 📦 API Integration

The frontend integrates with the SmoothSend gasless relayer backend:

### Endpoints Used
- `POST /api/v1/relayer/gasless/quote` - Get transaction quote
- `POST /api/v1/relayer/gasless/submit` - Submit gasless transaction
- `GET /api/v1/relayer/health` - Check relayer status
- `GET /api/v1/relayer/stats` - Get transaction statistics

### Example Usage
```typescript
// Get quote for gasless transaction
const quote = await fetch('/api/v1/relayer/gasless/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fromAddress: userAddress,
    receiverAddress: recipientAddress,
    amount: amountInMicroUSDC,
    coinType: usdcContractAddress
  })
});
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

### Environment Variables on Vercel
Add these in your Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_RELAYER_ADDRESS`
- `NEXT_PUBLIC_APTOS_NETWORK`
- `NEXT_PUBLIC_USDC_CONTRACT`
- `NEXT_PUBLIC_SMOOTHSEND_CONTRACT`

### Self-hosting
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

### Local Testing
```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build
```

### Integration Testing
1. Connect wallet (use testnet)
2. Ensure you have testnet USDC
3. Send gasless transaction
4. Verify on Aptos Explorer

## 📁 Project Structure

```
smoothsend-frontend/
├── app/
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn/ui components
│   │   ├── wallet-provider.tsx
│   │   ├── transfer-form.tsx
│   │   └── transaction-history.tsx
│   ├── lib/                 # Utilities
│   │   ├── api-service.ts   # Backend API calls
│   │   ├── utils.ts         # Helper functions
│   │   └── constants.ts     # App constants
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── public/                  # Static assets
├── .env.example             # Environment template
└── package.json
```

## 🎨 Customization

### Branding
Update `app/layout.tsx` for app metadata:
```typescript
export const metadata = {
  title: 'Your App Name',
  description: 'Your app description',
}
```

### Styling
Modify `app/globals.css` for custom themes:
```css
:root {
  --primary: your-brand-color;
  --background: your-bg-color;
}
```

### Contract Addresses
Update `.env.local` with your contract addresses for different networks.

## 🔗 Links

- **Live Demo**: https://smoothsend-frontend.vercel.app
- **Aptos Explorer**: https://explorer.aptoslabs.com/?network=testnet
- **Aptos Docs**: https://aptos.dev/
- **Next.js Docs**: https://nextjs.org/docs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Aptos wallet (Petra recommended)
- Testnet USDC tokens

### Setup
```bash
git clone https://github.com/SmoothSend/smoothsendfrontend.git
cd smoothsendfrontend
npm install
cp .env.example .env.local
# Configure .env.local
npm run dev
```

---

**Made with ❤️ for the Aptos ecosystem**

*Experience gasless transactions today!*# smoothsendfrontend
