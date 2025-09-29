const { boolean } = require("joi");
const mongoose=require("mongoose");

const userschema= new mongoose.Schema({
   name:{
    type:String,
    required:true,
    trim:true,
    min:3
   },
   email:{
    type:String,
    required:true,
    trim:true,
    lowercase:true,
    unique:true
   },
   password:{
    type:String,
    required:true,
    min:8
   },
   role:{
    type:String,
    enum:['user','admin'],
    default: 'user'
   },
   isDeleted:{
    type:Boolean,
    default:false
   }
  },{
  timestamps:true
});

module.exports=mongoose.model('User',userschema);