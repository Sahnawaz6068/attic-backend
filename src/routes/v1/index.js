import express from 'express';
import auth from './auth.js';
import otp from './otp.routes.js'
import product from './product.routes.js'
import cart from './cart.routes.js'

const router = express.Router();

router.use('/auth',auth);
router.use('/otp',otp);
router.use('/products',product);
router.use('/carts',cart)

export default router;