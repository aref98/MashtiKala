const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();
const isAuth = require('../middleware/is-auth');


router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/ShowProducts', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart',isAuth, shopController.getCart);

router.get('/contact', shopController.getContactForm);

router.get('/aboutUs',isAuth, shopController.getaboutUs);

router.post('/contact', shopController.postContact);

router.post('/finalInfo',isAuth, shopController.getForm);

router.post('/cart',isAuth, shopController.postCart);

router.post('/contact',isAuth, shopController.postContact);

router.post('/cart-decrease',isAuth, shopController.postdecreaseCart);

router.post('/cart-delete-item',isAuth, shopController.postCartDeleteProduct);

// router.get('/user-info',isAuth, shopController.getUserInfo);
router.post('/create-order',isAuth, shopController.postOrder);

router.get('/orders',isAuth, shopController.getOrders);
router.get('/orders/:orderId',isAuth, shopController.getInvoices);

module.exports = router;
