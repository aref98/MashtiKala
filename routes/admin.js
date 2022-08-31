const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

const {check}=require('express-validator');
// /admin/add-product => GET
router.get('/add-product',isAuth,isAdmin, adminController.getAddProduct);

// /admin/products => GET
router.get('/products',isAuth,isAdmin, adminController.getProducts);


router.get('/messages',isAuth,isAdmin, adminController.getMessages);

// /admin/add-product => POST
router.post('/add-product',isAuth,isAdmin,
[
check('title')
.isString()
.trim().isLength({min:4}).withMessage('طول نام محصول باید بیشتر از 4 حرف باشد'),
check('price').trim().isHexadecimal().withMessage('قیمت معتبر نیست').isLength({min:4}).withMessage('حداقل قیمت 1000 تومان است'),
check('description').trim().isLength({min:7}).withMessage('طول توضیحات حداقل 7 حرف باید باشد')

], adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth,isAdmin, adminController.getEditProduct);

router.post('/edit-product',isAuth,isAdmin,[
    check('title').isLength({min:4}).withMessage('طول نام محصول باید بیشتر از 4 حرف باشد').isString()
    .trim(),
    // check('imageUrl').trim().isURL().withMessage('عکس معتبر نیست'),
    check('price').trim().isHexadecimal().isLength({min:4}).withMessage('حداقل قیمت 1000 تومان است'),
    check('description').trim().isLength({min:7}).withMessage('طول توضیحات حداقل 7 حرف باید باشد'),
    check('category').isEmpty().withMessage('نوع محصول باید انتخاب شود'),
    check('region').isEmpty().withMessage('محل تولید محصول باید انتخاب شود')
    ], adminController.postEditProduct);

router.delete('/product/:productId',isAuth,isAdmin, adminController.deleteProduct);
router.delete('/message/:messageId',isAuth,isAdmin, adminController.deleteMessage);
router.post('/order-done',isAuth, adminController.postOrderDone);
router.get('/orders/:viewType',isAuth, adminController.getOrders);

router.get('/adminPanel',isAuth,isAdmin,adminController.getAdminPanel)
router.get('/charts',isAuth,isAdmin,adminController.getAdminCharts)

module.exports = router;
