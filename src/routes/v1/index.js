import express from 'express';
import auth from './auth.js';
import otp from './otp.routes.js'
import product from './product.routes.js'
import cart from './cart.routes.js'
import customization from './productCustomization.routes.js'
import aiRoutes from './ai.routes.js'
import checkoutRoutes from './checkout.routes.js'

const router = express.Router();

router.use('/auth',auth);
router.use('/otp',otp);
router.use('/products',product);
router.use('/carts',cart);
router.use('/custom',customization);
router.use("/ai", aiRoutes);
router.use("/checkout", checkoutRoutes);

export default router;