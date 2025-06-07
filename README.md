# PeerFlash - Decentralized Flashcard Learning Platform

A blockchain-powered flashcard learning platform that enables students to create, share, and verify their learning through XRPL and decentralized technologies.

## 🌟 Features

- **Flashcard Creation & Sharing**
  - Create and organize flashcard sets
  - Add images and explanations
  - Tag and categorize by subject/major

- **Decentralized Identity & Trust**
  - XRPL-based DID registration
  - Verifiable credentials for learning achievements
  - Trust metrics and attribution system

- **Multi-Chain Ecosystem**
  - XRPL MPTs for flashcard decks
  - Subject-specific subnets
  - Customizable credential rules

- **Peer-to-Peer Learning**
  - Offline sync via WebRTC/Bluetooth
  - Device backup and recovery
  - Local peer discovery

## 🚀 Tech Stack

- **Frontend**
  - React
  - Tailwind CSS
  - WebRTC for P2P sync
  - XRPL.js

- **Backend**
  - Node.js
  - Express.js
  - XRPL API
  - IPFS for storage

## 🛠️ Setup

1. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. Set up environment variables:
```bash
# Backend (.env)
XRPL_NODE_URL=wss://s.altnet.rippletest.net:51233
IPFS_API_URL=your_ipfs_api_url
JWT_SECRET=your_jwt_secret

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_XRPL_NODE_URL=wss://s.altnet.rippletest.net:51233
```

3. Start the development servers:
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend
npm start
```

## 📝 License

MIT License - See LICENSE file for details