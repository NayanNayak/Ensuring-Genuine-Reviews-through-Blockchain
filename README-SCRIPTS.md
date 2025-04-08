# Scripts for Running the Web3 E-commerce System

This document provides instructions on how to use the scripts to run the Web3 e-commerce system.

## Available Scripts

The following scripts are available to help you run the system:

1. `setup-web3.sh`: Sets up the Web3 environment (installs dependencies, creates directories)
2. `start-web3-services.sh`: Starts Ganache and IPFS services
3. `start-backend.sh`: Starts the backend server
4. `start-frontend.sh`: Starts the frontend server
5. `start-all.sh`: Starts all services (Web3, backend, and frontend)

## Prerequisites

- Node.js and npm installed
- Bash shell environment
- For `start-all.sh` on macOS: Terminal app access

## How to Use

### First-time Setup

```bash
# Make all scripts executable
chmod +x *.sh

# Run the setup script
./setup-web3.sh
```

### Starting Individual Services

```bash
# Start Web3 services (Ganache and IPFS)
./start-web3-services.sh

# Start the backend server
./start-backend.sh

# Start the frontend server
./start-frontend.sh
```

### Starting All Services at Once

```bash
# Start all services (Web3, backend, and frontend)
./start-all.sh
```

This will:
1. Start Ganache and IPFS in the background
2. Open a new terminal window for the backend server
3. Open another terminal window for the frontend server

## Troubleshooting

### Package.json Not Found

If you see an error like:
```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

Make sure you're running the scripts from the root directory of the project (where the `backend` and `frontend` directories are located).

### Script Permissions

If you can't execute the scripts, make sure they have execute permissions:
```bash
chmod +x *.sh
```

### Port Already in Use

If you see an error about ports already being in use, you may have services already running. You can stop them with:
```bash
# Find processes using the ports
lsof -i :3000  # Frontend port
lsof -i :5000  # Backend port
lsof -i :7545  # Ganache port
lsof -i :5001  # IPFS port

# Kill the processes
kill -9 <PID>
```

## Directory Structure

The scripts expect the following directory structure:
```
ecommerce_react_node/
├── backend/
│   └── package.json
├── frontend/
│   └── package.json
├── setup-web3.sh
├── start-web3-services.sh
├── start-backend.sh
├── start-frontend.sh
└── start-all.sh
```

Make sure you're running the scripts from the root directory of the project. 