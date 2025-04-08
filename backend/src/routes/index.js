import { Router } from 'express';

// helpers
import { verifyAccessToken } from '../helpers/jwt';

// routes
import auth from './auth';
import product from './product';
import order from './order';
import review from './review';
import delivery from './delivery';
import web3Review from './web3Review';

// controllers
import Review from '../controllers/review';

const router = Router();

router.get('/', (req, res) => {
  res.end('hey');
});

// Public routes
router.get('/public/reviews/product/:product_id', Review.GetReviewsByProduct);

router.use('/auth', auth);
router.use('/product', product);
router.use('/order', verifyAccessToken, order);
router.use('/review', verifyAccessToken, review);
router.use('/delivery', verifyAccessToken, delivery);
router.use('/web3-review', verifyAccessToken, web3Review);

export default router;
