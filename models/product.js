const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const productSchema=new Schema({
  title:{
    type:String,
    required:true
  },
  price:{
   type:Number,
   required:true
  },
  number:{
    type:Number,
    required:true
  },
  category:{
    type:String,
    required:true
  },
  region:{
    type:String,
    required:true

  },
  isPopular:{
   type:Boolean
  },
  description:{
    type:String,
    required:true
  },
   imageUrl:{
    type:String,
    required:true
   },
   userId:{
     type:Schema.Types.ObjectId,
     ref:'User',
     required:true
   },
   createdAt:Object,
   updatedAt:Object

},




);


module.exports=mongoose.model('Product',productSchema);

// const mongodb = require('mongodb');

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = parseInt(price,10);
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       // Update the product
//       dbOp = db
//         .collection('products')
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return dbOp
//       .then(result => {
//         // console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .then(products => {
//         // console.log(products);
//         return products;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then(product => {
//         // console.log(product);
//         return product;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static deleteById(prodId) {
//     const db = getDb();
    
//       return db
//     .collection('products')
//     .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//     .then(result => {
//       console.log('Deleted');

     
//        //return db.collections('users').deleteOne({'cart.items':new mongodb.ObjectId(prodId)})
//     })
//     .catch(err => {
//       console.log(err);
//     });

//   }
   
//    garbageCollector(){

//      const db = getDb();
//      console.log('sad');
    
//     return db
//     .collection('users')
//     .deleteAll({_id:new mongodb.ObjectID(this._id)})
//     .then(result=>{
//       console.log(result);
//     })
//     .catch(err => {
//       console.log(err);
//     });

//   }
// }

// module.exports = Product;
