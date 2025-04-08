import Web3 from 'web3';
import fs from 'fs';
import path from 'path';
import ipfsService from './ipfsService';

// Initialize Web3 with Ganache
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));

// Load contract ABI and address
let reviewContract;
let contractAddress;

// Initialize contract
const initContract = async () => {
  try {
    // Load contract ABI from build directory
    const contractPath = path.resolve(__dirname, 'build/contracts/ReviewContract.json');
    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const abi = contractJson.abi;
    
    // Get contract address from deployment
    contractAddress = contractJson.networks['5777'].address;
    
    // Create contract instance
    reviewContract = new web3.eth.Contract(abi, contractAddress);
    
    console.log('Review contract initialized at address:', contractAddress);
    return reviewContract;
  } catch (error) {
    console.error('Error initializing contract:', error);
    throw new Error('Failed to initialize review contract');
  }
};

/**
 * Get the contract instance
 * @returns {Object} - Contract instance
 */
export const getContract = async () => {
  if (!reviewContract) {
    await initContract();
  }
  return reviewContract;
};

/**
 * Verify a reviewer for a specific product
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Transaction receipt
 */
export const verifyReviewer = async (userId, productId) => {
  try {
    const contract = await getContract();
    
    // Get admin account (first account in Ganache)
    const accounts = await web3.eth.getAccounts();
    const adminAccount = accounts[0];
    
    // Call verifyReviewer function
    const tx = await contract.methods.verifyReviewer(userId, productId)
      .send({ from: adminAccount, gas: 200000 });
    
    console.log('Reviewer verified:', userId, 'for product:', productId);
    return tx;
  } catch (error) {
    console.error('Error verifying reviewer:', error);
    throw new Error('Failed to verify reviewer on blockchain');
  }
};

/**
 * Check if a reviewer is verified for a product
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<boolean>} - True if verified, false otherwise
 */
export const isReviewerVerified = async (userId, productId) => {
  try {
    const contract = await getContract();
    return await contract.methods.isReviewerVerified(userId, productId).call();
  } catch (error) {
    console.error('Error checking reviewer verification:', error);
    throw new Error('Failed to check reviewer verification');
  }
};

/**
 * Check if a user has already reviewed a product
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<boolean>} - True if already reviewed, false otherwise
 */
export const hasUserReviewed = async (userId, productId) => {
  try {
    const contract = await getContract();
    return await contract.methods.hasUserReviewed(userId, productId).call();
  } catch (error) {
    console.error('Error checking if user has reviewed:', error);
    throw new Error('Failed to check if user has reviewed');
  }
};

/**
 * Add a review to the blockchain
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {Object} reviewData - Review data to be stored
 * @returns {Promise<Object>} - Transaction receipt and IPFS hash
 */
export const addReview = async (userId, productId, reviewData) => {
  try {
    // Upload review data to IPFS
    const ipfsHash = await ipfsService.uploadToIPFS(reviewData);
    
    // Get contract instance
    const contract = await getContract();
    
    // Get admin account (first account in Ganache)
    const accounts = await web3.eth.getAccounts();
    const adminAccount = accounts[0];
    
    // Submit review to blockchain
    const tx = await contract.methods.submitReview(userId, productId, ipfsHash)
      .send({ from: adminAccount, gas: 200000 });
    
    console.log('Review added to blockchain:', ipfsHash, 'for product:', productId);
    return { tx, ipfsHash };
  } catch (error) {
    console.error('Error adding review to blockchain:', error);
    
    // Check if it's an IPFS error
    if (error.message && error.message.includes('IPFS')) {
      throw error; // Pass through IPFS errors
    }
    
    // Check if it's a Ganache connection error
    if (error.message && error.message.includes('connect')) {
      throw new Error('Cannot connect to Ganache blockchain. Please make sure Ganache is running.');
    }
    
    throw new Error(`Failed to add review to blockchain: ${error.message}`);
  }
};

/**
 * Fetch reviews for a product from the blockchain
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} - Array of reviews
 */
export const fetchReviews = async (productId) => {
  try {
    // Get contract instance
    const contract = await getContract();
    
    // Get reviews from blockchain
    const reviews = await contract.methods.getReviews(productId).call();
    
    // Fetch review data from IPFS
    const reviewsWithData = await Promise.all(
      reviews.map(async (review) => {
        const reviewData = await ipfsService.getFromIPFS(review.ipfsHash);
        return {
          ...reviewData,
          timestamp: new Date(review.timestamp * 1000).toISOString(),
          ipfsHash: review.ipfsHash
        };
      })
    );
    
    return reviewsWithData;
  } catch (error) {
    console.error('Error fetching reviews from blockchain:', error);
    throw new Error('Failed to fetch reviews from blockchain');
  }
};

export default {
  getContract,
  verifyReviewer,
  isReviewerVerified,
  hasUserReviewed,
  addReview,
  fetchReviews
}; 