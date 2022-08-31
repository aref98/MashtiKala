const Product = require('../models/product');
const Order = require('../models/order');
const Message = require('../models/message');
const {validationResult}=require('express-validator');
const mongosse=require('mongoose');
const fileHelper=require('../util/file');
const persianDate=require('persian-date');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError:false,
    errorMessage:[],
        oldInput:{}
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const number = req.body.number;
  const region = req.body.region;
  const category = req.body.category;
  var imageUrl;
  var errorMessage=[];
  var param;
  if(!req.session.image){
  req.session.image=image;
}
  if(!req.session.category){
  req.session.category=category;
  
}
  if(!req.session.region){
  req.session.region=region;
}
  
  if(req.session.image){
     imageUrl='/'+req.session.image.path;

  }
  console.log(imageUrl)
  const errors = validationResult(req);
   if(!imageUrl){
    errorMessage.push({msg:"عکس معتبر نیست"});
     param="image";
  }
   if(!req.session.region){
     errorMessage.push({msg:"محل تولید محصول را انتخاب کنید"});
     param="region";
  }
   if(!req.session.category){
    errorMessage.push({msg:"نوع محصول را انتخاب کنید"});
     param="category"
  }
 if(errorMessage.length>0){
    return res.status(422).render('admin/edit-product', {
      path: '/add-product',
      pageTitle: 'add-Product',
      editing: false,
      hasError:true,
      errorMessage: errorMessage,
      oldInput: {
        title: title,
        price:price,
        description:description,
        prodId:req.body.productId,
        category:req.session.category,
        region:req.session.region,
        number:number
      },
    });
  }
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      path: '/add-product',
      pageTitle: 'add-Product',
      editing: false,
      hasError:true,
      errorMessage: errors.array(),
      oldInput: {
        title: title,
        price:price,
        description:description,
        prodId:req.body.productId,
        imageUrl:'/'+req.session.image.path,
        category:req.session.category,
        region:req.session.region,
        number:number
      },
    });
  }


  var date= new persianDate().format();  
  completeDate=date.split(' ');
  hour=completeDate[1];
  date=completeDate[0].replace(/-/g,'/');
  date={date,hour}


  const product = new Product({
    title:title,
    price:price,
    description:description,
    imageUrl:imageUrl,
    userId:req.user._id,
    category:req.session.category,
    region:req.session.region,
    number:req.body.number,
    createdAt:date
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      req.session.image=null;
      req.session.region=null;
      req.session.category=null;
      res.redirect('/admin/products');
    })////////// اگر سرور خطا داد
    .catch(err => {
      console.log(err);
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error);
  //     return res.status(500).render('admin/edit-product', {
  //       path: '/add-product',
  //       pageTitle: 'add-Product',
  //       editing: false,
  //       hasError:true,
  //       errorMessage:[{msg:
  //  ' خطای سرور رخ داده است و این عملیات در حال حاضر امکان پذیر نیست، اگر این خطا را بیشتر از یک بار مشاهده کردید. لطفا به  تیم پشتیبانی اطلاع دهید'
  //       }],
  //       serverError:true,
  //       oldInput: { 
  //         title: title,
  //         imageUrl: imageUrl,
  //         price:price,
  //         description:description,
  //         prodId:req.body.productId
  //       }
  //     });
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        hasError:false,
        product: product,
        errorMessage:[],
        oldInput:{prodId:prodId}
      });
    })
    .catch(err => {
      console.log(err)
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedRegion = req.body.region;
  const updatedDesc = req.body.description;
  const updatedNumber = req.body.number;
  const updatedCategory = req.body.category;
  const errors = validationResult(req);
  console.log(errors.array())
  if (!errors.isEmpty()) {
    return res.statder('admin/adminPanel/edit-product', {
      path: '/edit-product',
      pageTitle: 'Edit-Product',
      editing: true,
      hasError:true,
      errorMessage: errors.array(),
      product:[],
      oldInput:{
        title: updatedTitle,
        price:updatedPrice,
        description:updatedDesc,
        prodId:prodId,
        image:image,
        category:updatedCategory,
        region:updatedRegion,
        number:updatedNumber
      },
      validationErrors: errors.array()
    });
  }


  var date= new persianDate().format();  
  completeDate=date.split(' ');
  hour=completeDate[1];
  date=completeDate[0].replace(/-/g,'/');
  date={date,hour}


  return Product.findById(prodId).then(product=>{
    if(product.userId.toString()!==req.user._id.toString()){
      return res.redirect('/');
    }
    product.title=updatedTitle;
    product.price=updatedPrice;
    product.description=updatedDesc;
    product.updatedAt=date;
    if(updatedCategory){
      product.category=updatedCategory;
    }
    product.number=updatedNumber;
    if(image){
      fileHelper.deleteFile(product.imageUrl.split('/')[1]);
      product.imageUrl='/'+image.path;
    }
    return product.save().then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
  })
    .catch(err => {
      console.log(err)
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error);
    });
    
};

exports.getProducts = (req, res, next) => {
  Product.find({userId:req.user._id})
    .then(products => {
      res.render('admin/adminPanel/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
          });
    })
    .catch(err =>{ console.log(err)
      const error=new Error(err);
      error.httpStatusCode=500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findOne({_id:prodId})
  .then(product=>{
    if(!product){
      return next(new Error('محصول مورد نطر یافت نشد -خطا درهنگام پاک کردن محصول'));
    }
    fileHelper.deleteFile(product.imageUrl.split('/')[1]);
    return  Product.deleteOne({_id:prodId ,userId:req.user._id});
  })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.status(200).json({message:'succssefull'});
    })
    .catch(err =>{ console.log(err)
     
      res.status(500).json({message:'succssefull'});

    }
      );
};
exports.deleteMessage = (req, res, next) => {
  const messageId = req.params.messageId;
  Message.findOne({_id:messageId})
  .then(message=>{
    if(!message){
      return next(new Error('پیام مورد نطر یافت نشد -خطا درهنگام پاک کردن پیام'));
    }
    return  Message.deleteOne({_id:messageId });
  })
    .then(() => {
      console.log('DESTROYED MESSAGE');
      res.status(200).json({message:'succssefull'});
    })
    .catch(err =>{ console.log(err)
     
      res.status(500).json({message:'succssefull'});

    }
      );
};
exports.getAdminPanel=(req,res,next)=>{
  Product.find({userId:req.user._id})
  .then(products=>{
    res.render('admin/adminPanel/dashboard', {
       products:products
    });
  })
  .catch(err =>{ console.log(err)
    const error=new Error(err);
    error.httpStatusCode=500;
    return next(error);
  });

  
    }

    exports.getAdminCharts = (req,res,next)=>{
      res.render('admin/adminPanel/charts',{

      })
    }

    exports.getAdminTables = (req,res,next)=>{
      res.render('admin/adminPanel/tables',{

      })
    }

    exports.getMessages = (req,res,next)=>{

      Message.find()
      .then(messages=>{
            return  res.render('admin/adminPanel/inbox',{
              pageTitle:'inbox',
              path:'/inbox',
              messages:messages
        })
      })
      .catch(err=>{
        console.log(err)
      })
     
    }



    exports.getOrders = (req, res, next) => {
      viewType=req.params.viewType;//delivered or in progress
      if(viewType=='new'){
        var numCount=0;
        var totalPrice=0;

        return Order.find({condition:'in progress'}).countDocuments()
        .then(num=>{
          numCount=num;
         return Order.find({condition:'in progress'}).select('totalPrice').then(prices=>{
            console.log(prices[0])
            prices.forEach(price => {
              totalPrice+= parseInt(price.totalPrice);
            });
            return totalPrice;


          })
        }).then(totalPrice=>{
          Order.find({condition:'in progress'})
          .then(orders => {
            res.render('admin/adminPanel/orders', {
              path: '/orders',
              pageTitle: 'Your Orders',
              orders: orders,
              totalPrice:totalPrice,
              numCount:numCount
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
        })
     
      }

      else{
        var numCount=0;
        var totalPrice=0;

        return Order.find({condition:'delivered'}).countDocuments()
        .then(num=>{
          numCount=num;
         return Order.find({condition:'delivered'}).select('totalPrice').then(prices=>{
            console.log(prices[0])
            prices.forEach(price => {
              totalPrice+= parseInt(price.totalPrice);
            });
            return totalPrice;


          })
        }).then(totalPrice=>{
          Order.find({condition:'delivered'})
          .then(orders => {
            res.render('admin/adminPanel/orders', {
              path: '/orders',
              pageTitle: 'Your Orders',
              orders: orders,
              totalPrice:totalPrice,
              numCount:numCount
      
            });
          })
        })
       
        .catch(err=>{
          console.log(err);
          const error=new Error(err);
          error.httpStatusCode=500;
          error.message='خطا هنگام نمایش سفارشات';
          console.log(error.message);
          return next(error);
        });
      }
      
      
    };


    exports.postOrderDone=(req,res ,next)=>{
      const orderId=req.body.orderId;
      var date= new persianDate().format();  
      completeDate=date.split(' ');
      hour=completeDate[1];
      date=completeDate[0].replace(/-/g,'/');
      date={date,hour}   
     Order.findById(orderId)
       .then(order => {
   
         order.condition='delivered'
         order.deliveryDate=date;
         return order.save();
   
       })
       .then(result => {
        return res.redirect('/admin/orders/sdasd')
       })
       .catch(err => next(err));
   
   
   
   }