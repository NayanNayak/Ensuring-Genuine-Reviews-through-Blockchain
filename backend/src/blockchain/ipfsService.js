import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Configure IPFS client
// For local IPFS node - using explicit IPv4 address to avoid IPv6 resolution issues
const ipfs = create({ host: '127.0.0.1', port: '5001', protocol: 'http' });

// For Infura IPFS (commented out)
// const projectId = process.env.INFURA_IPFS_PROJECT_ID;
// const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
// const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
// 
// // Create IPFS client with the dedicated IPFS gateway
// const ipfs = create({
//   host: 'ipfs.infura.io',
//   port: 5001,
//   protocol: 'https',
//   headers: {
//     authorization: auth,
//   },
//   apiPath: '/api/v0'  // Explicitly set the API path
// });

/**
 * Upload review content to IPFS
 * @param {Object} reviewData - Review data to be stored
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export const uploadToIPFS = async (reviewData) => {
  try {
    // Convert review data to JSON string
    const reviewJSON = JSON.stringify(reviewData);
    
    // Upload to IPFS
    const { cid } = await ipfs.add(Buffer.from(reviewJSON));
    
    // Return the IPFS hash (CID)
    return cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to local IPFS node. Please make sure IPFS daemon is running on your machine.');
    }
    
    throw new Error(`Failed to upload review to IPFS: ${error.message}`);
  }
};

/**
 * Retrieve review content from IPFS
 * @param {string} ipfsHash - IPFS hash (CID) to retrieve
 * @returns {Promise<Object>} - Review data
 */
export const getFromIPFS = async (ipfsHash) => {
  try {
    // Get data from IPFS
    const stream = ipfs.cat(ipfsHash);
    
    // Collect all chunks
    let data = [];
    for await (const chunk of stream) {
      data.push(chunk);
    }
    
    // Combine chunks and parse JSON
    const reviewJSON = Buffer.concat(data).toString();
    return JSON.parse(reviewJSON);
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to local IPFS node. Please make sure IPFS daemon is running on your machine.');
    }
    
    throw new Error(`Failed to retrieve review from IPFS: ${error.message}`);
  }
};

export default {
  uploadToIPFS,
  getFromIPFS
}; 