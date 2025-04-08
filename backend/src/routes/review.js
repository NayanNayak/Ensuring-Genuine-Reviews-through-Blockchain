import express from 'express';
const router = express.Router();

import Review from '../controllers/review';
import grantAccess from '../middlewares/grantAccess';
import { verifyAccessToken } from '../helpers/jwt';

// Protected routes (require authentication)
router.post(
  '/',
  verifyAccessToken,
  grantAccess('create', 'review'), // User can create a review
  Review.Create
);

router.delete(
  '/:reviewId',
  verifyAccessToken,
  grantAccess('delete', 'review'), // Admin can delete any review
  Review.Delete
);

// Public routes (no authentication required)
router.get(
  '/product/:product_id',
  Review.GetReviewsByProduct
);

// Admin routes
router.get(
  '/all',
  verifyAccessToken,
  grantAccess('readAny', 'review'), // Admin can see all reviews
  Review.ListAllReviews
);

export default router;
