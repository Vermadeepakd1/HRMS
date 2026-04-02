# Mini AI-HRMS

Mini AI-HRMS is a production-minded Human Resource Management System for small and mid-sized organizations. It combines employee and task management, a rule-based productivity intelligence layer, and optional Web3 logging for task completion proofs.

## Project Overview

The app is split into a React frontend and a Node.js backend. Admin users can register and log in, create employees, assign tasks, monitor productivity, and log task completion events to Polygon Amoy using MetaMask. The system keeps detailed workforce data in MongoDB while storing only blockchain transaction proofs on-chain.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Auth: JWT
- AI Layer: Rule-based productivity scoring
- Web3: ethers.js, MetaMask, Polygon Amoy testnet

## Features

- JWT-based admin authentication
- Employee management with role, department, skills, and wallet address
- Task management with assigned employee, status, due date, completion timestamp, and transaction hash
- Dashboard with employee and task counts plus productivity insights
- Rule-based productivity score per employee
- MetaMask wallet connection
- On-chain logging for task completion proofs
- Edit and delete actions for employees and tasks

## Setup Steps

### 1. Prerequisites

- Node.js 18+ installed
- MongoDB running locally or a MongoDB Atlas connection string
- MetaMask installed in your browser for Web3 features

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
```

Create a `.env` file in `client/` with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

### 4. Use the app

1. Open the frontend in your browser.
2. Register or log in as admin.
3. Add employees.
4. Create and manage tasks.
5. Open the Tasks page to connect MetaMask and test Web3 logging.
6. Complete a task to store the blockchain transaction hash in the database.

## Notes

- Completed tasks are locked and cannot be changed back to another status.
- Blockchain logs are intentionally minimal to keep gas costs low.
- Detailed HRMS data stays off-chain in MongoDB; the blockchain stores only transaction proof.
