const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const messageSchema=new Schema({
    user:{
        email:{
            type:String,
            require:true
        },
     name:String
        
    },
    message:String

      
      
})
module.exports=mongoose.model('Message',messageSchema);