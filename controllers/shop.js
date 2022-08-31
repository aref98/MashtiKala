const Product = require('../models/product');
const Order = require('../models/order');
const Message = require('../models/message');
const path = require('path');
const fs = require('fs');
const contentDisposition = require('content-disposition')
const nodemailer=require('nodemailer');

const pdfDocument=require('pdfkit');
const persianDate=require('persian-date');

const LIMIT_PHOTO_PER_PAGE=9;

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
      user: 'atb.1394@gmail.com',
      pass: 'v for mafia'
  }
});


exports.getProducts = (req, res, next) => {
  const pageNumber=+req.query.page || 1;
  
  var category = req.query.category;  
  var region = req.query.region;  

   if((!category || category=='همه')&&!region){
  return res.redirect('/')
   }

  var totalItems;
  if(category){
  Product.find({category:category}).countDocuments()
  .then(numProducts=>{
    totalItems=numProducts;
    return Product.find({category:category}).skip((pageNumber-1)*LIMIT_PHOTO_PER_PAGE)
    .limit(LIMIT_PHOTO_PER_PAGE)
  })
  
    .then(products => {
      res.render('shop/showProducts', {
        prods: products,
        pageTitle: 'shop',
        path: '/products',
        currentPage:pageNumber,
        hasNextPage:LIMIT_PHOTO_PER_PAGE*pageNumber<totalItems,
        hasPreviousPage:pageNumber>1,
        nextPage:pageNumber+1,
        previousPage:pageNumber-1,
        lastPage:Math.ceil(totalItems/LIMIT_PHOTO_PER_PAGE)

      });
    })
    .catch(err => {
      console.log(err);
      
      const error=new Error(err);
      error.httpStatusCode=500;
      error.message='خطا هنگام نمایش محصول به کاربر';
      console.log(error.message)
      return next(error);
    });
  }
  else{

    Product.find({category:category}).countDocuments()
    .then(numProducts=>{
      totalItems=numProducts;
      return Product.find({region:region}).skip((pageNumber-1)*LIMIT_PHOTO_PER_PAGE)
      .limit(LIMIT_PHOTO_PER_PAGE)
    })
    
      .then(products => {
        res.render('shop/showProducts', {
          prods: products,
          pageTitle: 'shop',
          path: '/'+region,
          currentPage:pageNumber,
          hasNextPage:LIMIT_PHOTO_PER_PAGE*pageNumber<totalItems,
          hasPreviousPage:pageNumber>1,
          nextPage:pageNumber+1,
          previousPage:pageNumber-1,
          lastPage:Math.ceil(totalItems/LIMIT_PHOTO_PER_PAGE)
  
        });
      })
      .catch(err => {
        console.log(err);
        
        const error=new Error(err);
        error.httpStatusCode=500;
        error.message='خطا هنگام نمایش محصول به کاربر';
        console.log(error.message)
        return next(error);
      });
    } 

  }
  
  


exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const pageNumber=+req.query.page || 1;
  var totalItems;
  Product.find().countDocuments()
  .then(numProducts=>{
    totalItems=numProducts;
    return Product.find().skip((pageNumber-1)*LIMIT_PHOTO_PER_PAGE)
    .limit(LIMIT_PHOTO_PER_PAGE)
  })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage:pageNumber,
        hasNextPage:LIMIT_PHOTO_PER_PAGE*pageNumber<totalItems,
        hasPreviousPage:pageNumber>1,
        nextPage:pageNumber+1,
        previousPage:pageNumber-1,
        lastPage:Math.ceil(totalItems/LIMIT_PHOTO_PER_PAGE)

      });
    })
    .catch(err => {
      console.log(err);
      const error=new Error(err);
      error.httpStatusCode=500;
      error.message='خطا هنگام نمایش محصول به کاربر';
      console.log(error.message)
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      productsTemp=user.cart.items;
     const products = productsTemp.filter(product => product.productId !==null);
      console.log(user.cart);
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });
    })
    .catch(err => {
      console.log(err)
      const error=new Error(err);
      error.httpStatusCode=500;
      error.message='خطا هنگام نمایش سبد خرید به کاربر';
      console.log(error.message)
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    }).catch(err=>{
      console.log(err);
      const error=new Error(err);
      error.httpStatusCode=500;
      error.message='خطا هنگام ثبت  سبد خرید';
      console.log(error.message);
      return next(error);
    });
 
};


exports.postContact=(req,res,next)=>{

const messageContent=req.body.message;
const email=req.body.email;
const name=req.body.name;

 const message=new Message({

  user:{
    email:email,
    name:name,
  },
  message:messageContent,
  
 })

  message.save()
  .then(result=>{
    return res.render('shop/contact',{
      message:'پیام شما با موفقیت ارسال شد',
      pageTitle: 'Contact Form',
      path:'/contact'

    })
  })
  .catch(err=>{
    console.log(err);
      const error=new Error(err);
      error.httpStatusCode=500;
      error.message='خطا ثبت پیام';
      console.log(error.message);
      return next(error);
  })


}
exports.postdecreaseCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.decreaseFromCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    }).catch(err=>{
      console.log(err);
      const error=new Error(err);
      error.httpStatusCode=500;
      error.message='خطا هنگام ثبت  سبد خرید';
      console.log(error.message);
      return next(error);
    });
 
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(result=>{
    console.log(result)
      res.redirect('/cart');
    }).catch(err=>{
      console.log(err);
      const error=new Error(err);
      error.httpStatusCode=500;
      error.message='خطا هنگام پاک کردن سبد خرید';
      console.log(error.message);
      return next(error);
    });
 
};

exports.postOrder = (req, res, next) => {
  if(!req.user.cart.items[0]){
    return res.redirect('/cart')
  }
  totalPrice=req.body.totalPrice;
  userName=req.body.name;
  email=req.body.email;
  phoneNumber=req.body.phoneNumber;
  address=req.body.address;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
    
       const products=user.cart.items.map(i=>{
        return {productTitle:i.productId.title,productPrice:i.productId.price , quantity:i.quantity}
       })
      var date= new persianDate().format();  
      completeDate=date.split(' ');
      hour=completeDate[1];
      date=completeDate[0].replace(/-/g,'/');
      date={date,hour}
      //  deliveryDate=Date.now();
      const order= new Order({
        user:{
        email:req.user.email,
        userId:req.user._id,
        userName:userName,
        phoneNumber:phoneNumber,
        address:address
        },
        products:products,
        totalPrice:totalPrice,
        orderDate:date,
        condition:'in progress'
      })
   return order.save()
      .then(result => {


        req.user.cart={}
       
          return req.user.save();

      }).then(result=>{
          res.redirect('/orders');
        return transporter.sendMail({
          from: 'atb.1394@gmail.com',
          to: email,
          subject: 'سفارش شما ثبت شد. ',
          html: `
          <h1 style='text-align:center'>برای پیگیری سفارش خود لینک زیر را دنبال کنید</h1>
         <a style='text-align:center; font-size:25px' href="http://localhost:3000/orders/">سفارش های من</a>
         `
    
        }).then(result=>{
             console.log(result);
        }).catch(err=>{
          console.log(err);
          
        });

      })
      .catch(err=>{
        console.log(err);
        const error=new Error(err);
        error.httpStatusCode=500;
        error.message='خطا هنگام ثبت سفارش';
        console.log(error.message);
        return next(error);
      });
   
          
  });
     
     
  
    
    
};

exports.getOrders = (req, res, next) => {
  req.user
  .getOrders(req.user._id)
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,

      });
    })
    .catch(err=>{
      console.log(err);
      const error=new Error(err);
      error.httpStatusCode=500;
      error.message='خطا هنگام نمایش سفارشات';
      console.log(error.message);
      return next(error);
    });
 
};


exports.getInvoices=(req,res,next)=>{
  const orderId=req.params.orderId;
  const invoiceName=orderId+'.'+'pdf';
  const invoicePath=path.join('data','invoices',invoiceName);
  
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('!سفارشی یافت نشد'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('!دسترسی مجاز نیست'));
      }
      const pdfDoc=new pdfDocument();
      var disposition = contentDisposition.parse('inline; filename="EURO rates.txt"; filename*=UTF-8\'\'%e2%82%ac%20rates.txt')
      res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', disposition);
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(25).text('invoice');
        pdfDoc.fontSize(18).text('invoice number:  '+order._id);
        pdfDoc.fontSize(17).text('customer name:'+order.user)
    
        pdfDoc.end();
       
             })
    .catch(err => next(err));

}


exports.getForm=(req,res,next)=>{
  
const totalPrice=req.body.totalPrice;

 return res.render('shop/finalInfo', {
  path: '/orders',
  pageTitle: 'Your Orders',
  totalPrice: totalPrice,

});

}

exports.getaboutUs=(req,res,next)=>{
  
  const totalPrice=req.body.totalPrice;
  
   return res.render('shop/aboutUs', {
    path: '/orders',
    pageTitle: 'Your Orders',
    totalPrice: totalPrice,
  
  });
  
  }

exports.getContactForm=(req,res,next)=>{
  
  
   return res.render('shop/contact', {
    path: '/contact',
    pageTitle: 'Contact Form',
    message:false,
    path:'/contact'

  
  });
  
  }

