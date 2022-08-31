
const express = require('express');

const {check,body} = require('express-validator');

const authController = require('../controllers/auth');
const User=require('../models/user')
const router = express.Router();
 
router.get('/login',authController.getLogin);

router.post('/login',[check('email'),check('password').trim()],authController.postLogin);

router.post('/logout',authController.postLogout);

router.get('/signup',authController.getSignup);

router.post('/signup',
[
check('email').isEmail().withMessage('آدرس ایمیل صحیح نمی باشد')
.custom((value,{req})=>{
    
    return User.findOne({email:value}).then(userDoc=>{
      if(userDoc){
        return Promise.reject('کاربر با این ایمیل وجود دارد');
      }
    })
    })
,body('password').trim().isLength({min:6}).withMessage('تعداد حروف رمز عبور حداقل شش کاراکتر باید باشد')
//.isAlphanumeric().withMessage('برای رمز عبور تنها از حروف و اعداد استفاده کنید')
,body('confirmPassword').trim().custom((value,{req})=>{
  if(value!==req.body.password){
    throw new Error('رمز عبور و تکرار رمز عبور باید برابر باشند');
  }
  return true;
})
],
authController.postSignup);

router.get('/reset',authController.getReset);

router.post('/reset',authController.postReset);

router.get('/reset/:token',authController.getNewPassword);

router.post('/new-password',authController.postNewPassword);



module.exports = router;
