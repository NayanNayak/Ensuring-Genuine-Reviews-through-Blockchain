// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReviewContract {
    struct Review {
        string ipfsHash;
        uint256 timestamp;
    }

    // Mapping from productId to array of reviews
    mapping(string => Review[]) private productReviews;
    
    // Mapping to track if a user has already reviewed a product
    mapping(string => mapping(string => bool)) private hasReviewed;
    
    // Mapping to store verified reviewers (userId => productId => bool)
    mapping(string => mapping(string => bool)) private verifiedReviewers;

    // Events
    event ReviewSubmitted(string productId, string ipfsHash, string userId, uint256 timestamp);
    event ReviewerVerified(string userId, string productId);

    // Owner of the contract
    address private owner;

    constructor() {
        owner = msg.sender;
    }

    // Modifier to check if the caller is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Verify a reviewer for a specific product (called by backend)
    function verifyReviewer(string memory userId, string memory productId) public onlyOwner {
        verifiedReviewers[userId][productId] = true;
        emit ReviewerVerified(userId, productId);
    }

    // Submit a review for a product
    function submitReview(string memory userId, string memory productId, string memory ipfsHash) public onlyOwner {
        // Check if the reviewer is verified for this product
        require(verifiedReviewers[userId][productId], "User is not authorized to review this product");
        
        // Check if the reviewer has already reviewed this product
        require(!hasReviewed[userId][productId], "User has already reviewed this product");
        
        // Create a new review
        Review memory newReview = Review({
            ipfsHash: ipfsHash,
            timestamp: block.timestamp
        });
        
        // Add the review to the product's reviews
        productReviews[productId].push(newReview);
        
        // Mark that this reviewer has reviewed this product
        hasReviewed[userId][productId] = true;
        
        // Emit an event
        emit ReviewSubmitted(productId, ipfsHash, userId, block.timestamp);
    }

    // Get all reviews for a product
    function getReviews(string memory productId) public view returns (Review[] memory) {
        return productReviews[productId];
    }

    // Check if a reviewer is verified for a product
    function isReviewerVerified(string memory userId, string memory productId) public view returns (bool) {
        return verifiedReviewers[userId][productId];
    }

    // Check if a reviewer has already reviewed a product
    function hasUserReviewed(string memory userId, string memory productId) public view returns (bool) {
        return hasReviewed[userId][productId];
    }
} 