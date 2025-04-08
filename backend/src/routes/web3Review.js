import express from 'express';
const router = express.Router();

import web3ReviewController from '../blockchain/web3ReviewController';
import web3AuthMiddleware from '../blockchain/web3AuthMiddleware';
import grantAccess from '../middlewares/grantAccess';

// Submit a Web3 review (IPFS + Blockchain)
router.post(
  '/',
  grantAccess('create', 'review'), // User must have permission to create reviews
  web3AuthMiddleware.validateReviewer, // Validate reviewer using SDC and blockchain
  web3ReviewController.submitWeb3Review
);

// Get Web3 reviews for a product (admin only)
router.get(
  '/product/:product_id',
  grantAccess('readAny', 'review'), // Admin only
  web3ReviewController.getWeb3Reviews
);

export default router; 