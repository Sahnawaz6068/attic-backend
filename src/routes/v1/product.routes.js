
import express from "express";
import productController from "../../Controller/product.controller.js";
import authenticate from "../../middlewares/auth.middleware.js";
import authorize from "../../middlewares/authorize.middleware.js";

const router = express.Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/slug/:slug", productController.getProductBySlug);

//User customise user here need to login first
router.get('/customize',
    authenticate,
    (req,res)=>{
    res.send("hello")
})

// Protected admin routes
router.post(
  "/admin",
  authenticate,
  authorize("admin"),
  productController.createProduct
);

router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  productController.getAllProducts
);

router.get(
  "/admin/:productId",
  authenticate,
  authorize("admin"),
  productController.getProductById
);

router.patch(
  "/admin/:productId",
  authenticate,
  authorize("admin"),
  productController.updateProduct
);

router.delete(
  "/admin/:productId",
  authenticate,
  authorize("admin"),
  productController.deleteProduct
);

export default router;
