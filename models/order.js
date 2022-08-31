const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const orderSchema=new Schema({
    user:{
        email:{
            type:String,
            require:true
        },
        userId:{
        type:Schema.Types.ObjectId,
        ref:'User'
        },
        userName:String,
        phoneNumber:String,
        address:String
    },
    products:[
        {
     
              type:Object,
              require:true
           
        }
            ],
    totalPrice:{
        type:Number,
        required:true
    },
    orderDate:Object,
    condition:String,
    deliveryDate:Object

      
      
})
module.exports=mongoose.model('Order',orderSchema);