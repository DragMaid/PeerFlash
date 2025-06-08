# PeerFlash - Decentralized Flashcard Learning Platform

A blockchain-powered flashcard learning platform that enables students to create, share, and verify their learning through XRPL and decentralized technologies.
=====================================================

PeerFlash: Decentralized Flashcard Learning Platform
=====================================================

Tagline: Study, Share, Earn – Even Offline  
Built for: Ripple x EasyA Hackathon 2025  
Track: XRPL Amendments & Cross-Chain Innovation

-----------------------------------------------------
Overview
-----------------------------------------------------
PeerFlash is a decentralized flashcard platform designed for students in disaster-prone and low-connectivity regions. It uses XRPL for blockchain attribution, P2P networking for offline sync, and verifiable credentials to prove learning achievements — even when traditional infrastructure fails.

-----------------------------------------------------
Core Features
-----------------------------------------------------
- Blockchain Attribution: Every flashcard is signed immutably on XRPL
- Peer-to-Peer Sync: Share study materials via local connections like Bluetooth or WiFi
- Verifiable Credentials: Students earn proof of study achievements (VCs)
- Creator Royalties: Earn XRP from your flashcards
- Offline Resilience: Access learning even when internet is down



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
-----------------------------------------------------
Problem We Solve
-----------------------------------------------------
“How might we ensure continuous, verifiable learning when infrastructure fails?”

Key Pain Points:
- Infrastructure loss disrupts study access
- No attribution system for content creators
- Lack of offline-first educational tools
- No way to prove student learning remotely

-----------------------------------------------------
Tech Stack
-----------------------------------------------------

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
-----------------------------------------------------
XRPL Integration
-----------------------------------------------------
- Multi-Purpose Tokens (MPTs) → Flashcard ownership & royalty tracking
- Decentralized Identifiers (DIDs) → Private student identity
- Verifiable Credentials (VCs) → Proof of learning
- Cross-chain architecture for future EVM compatibility

-----------------------------------------------------
Demo & Screenshots
-----------------------------------------------------
Live Demo: [Insert Demo URL]  
Screenshots: `/screenshots` folder

Demo Highlights:
- Create flashcard with immutable attribution
- P2P sharing with another device
- Offline study experience
- Verifiable Credential earned after completion

-----------------------------------------------------
How to Run Locally
-----------------------------------------------------
Requirements: Node.js, npm, Git

Steps:
1. git clone https://github.com/your-username/peerflash.git
2. cd peerflash
3. npm install
4. npm start




## :tools: Setup

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

-----------------------------------------------------
Team PeerFlash
-----------------------------------------------------
- **Vu Hoang Hai Binh (Kato)** – Idea initiator, backend development, API integration
- **Min Thiha Khine (Alex)** – UI/UX design, frontend, converted initial idea into an MVP
- **Phuc** – Backend development and support
- **Han Win Tun (Hanks)** – Research, concept validation, and presentation strategy

-----------------------------------------------------
Roadmap
-----------------------------------------------------
- ✅ MVP completed with XRPL & P2P
- 🚀 Mobile app development underway
- 🔄 LMS integrations coming soon
- 🌏 Beta launch planned for Singapore
- 📚 Expansion to high-risk disaster regions in SE Asia

-----------------------------------------------------
Contributing
-----------------------------------------------------
We welcome contributions! Open a GitHub issue or pull request to suggest improvements or new features.

-----------------------------------------------------
License
-----------------------------------------------------
MIT License — Free to use, fork, and adapt. Attribution required.

-----------------------------------------------------
Contact
-----------------------------------------------------
GitHub: https://github.com/your-username/peerflash  
Email: your-email@example.com  
Demo: [Insert Demo Link]  
LinkedIn: [Insert LinkedIn URL]

Quote: “Share your flashcards with the world, but the ownership stays yours forever.”
