const User=require("../models/user");
const bcrypt=require("bcrypt");
const joi=require("joi");
const jwt=require("jsonwebtoken");
const {generateAccessToken,generateRefreshToken}=require("../utils/generateToken");

const registerSchema= joi.object({
  name:joi.string().min(3).required(),
  email:joi.string().email().required(),
  password:joi.string().min(8).required(),
  admincode:joi.string().allow("").optional(),
});

const loginSchema=joi.object({
  email:joi.string().email().required(),
  password: joi.string().required()
});


const registerUser=async (req,res)=>{
  try{
    const { error } = registerSchema.validate(req.body, { allowUnknown: true });
    if(error){
      return res.status(400).json({
        messege: error.details[0].message
      });
    }

    const {name,email,password,admincode}=req.body;
    const existUser=await User.findOne({email});
    if(existUser){
      return res.status(400).json({messege: "User ALready Exist" });
    }

    const hashPassword= await bcrypt.hash(password,10);

    let role="user";
   if(admincode&&admincode.trim()===process.env.ADMIN_SECRET.trim())
    { role="admin";}
  

    const newUser= await User.create({
      name,
      email,
      password:hashPassword,
      role
    });
    const accessToken=generateAccessToken(newUser);
    const refreshToken=generateRefreshToken(newUser);
    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
      sameSite:"Strict",
      maxAge:7*24*60*60*1000,
    });
    
    
    res.status(201).json({messege:"User Registered Successfully",
       User:{
        id:newUser._id,
       name:newUser.name,
       email:newUser.email,
       role:newUser.role
       },
      });
  }
  catch(err){
    console.error("error in register/login process",err);
    res.status(500).json({messege:"Something Went Wrong",
      error:err.message
    });
  }
};





const loginUser= async (req,res)=>{
  try{

    const{error}= loginSchema.validate(req.body);
    if(error){
      return res.status(400).json({
        message:error.details[0].message
      });
    }

    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(!user){
      return res.status(400).json({messege:"User NOT FOUND"});
    }
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.status(400).json({messege:"Invalid Password"});
    }
    const accessToken=generateAccessToken(user);
    const refreshToken=generateRefreshToken(user);
    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      secure:process.env.NODE_ENV==="production",
      sameSite:"Strict",
      maxAge: 7*24*60*60*1000,
    });
    res.status(200).json({
      messege:"Login Successfull",
      accessToken,
      user:{
        id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
      },
    });

  
  }
  catch(err){
    console.error("Login error:",err);
    res.status(500).json({messege:"Something went seriously wrong", error: err.messege});
  }
};




  const logoutUser= (req,res)=>{
    res.clearCookie("refreshToken");
    res.status(200).json({messege:"Logged Out Successfully"});
  };
  


  const getUserProfile= async (req,res)=>{
    try{
      const user=await User.findById(req.user.id).select("-password-___v");
      if(!user){
        return res.status(404).json({message:"User not found"})
      }
      res.status(200).json({
        name:user.name,
        email:user.email,
        role:user.role,
      });
    }
    catch(err){
      res.status(500).json({Message:"Server Error",err});
    }
  };


  const getAllUser=async (req,res)=>{
    try{
      const users=await User.find().select("-password -accessToken");
      res.status(200).json(users);
    }
    catch(err){
      res.status(500).json({message:"Server error",error:err.message});
    }
  };

  const deleteUser=async (req,res)=>{
    try{
      const userid=req.params.id;
      const deleteduser=await User.findByIdAndDelete(userid);

      if(!deleteduser){
        return res.status(404).json({message:"User Not Found"});
      }
      res.status(200).json({message:"User Deleted Successffully"});
    }
    catch(err){
      res.status(500).json({message:"Sever Eroor",error:err.message});
    }
  };

  const softdeleteUser=async (req,res)=>{
    try{
      const userId=req.params.id;
      const deleteUser=await User.findById(userId);
      if(!deleteUser){
        return res.status(404).json({message:"User Not Found"});
      }
      deleteUser.isDeleted=true;
      await deleteUser.save();
      res.status(200).json({message:"User soft deleted successfully"});
    }
    catch(err){
      res.status(500).json({message:"server error",error:err.message});
    }
  }


  const updateUser=async (req,res)=>{
    try{
      const userId=req.user.id;
      const updates=req.body;

      const user=await User.findById(userId);
      if(!user){
      return res.status(404).json({message:"User not found"});
    }      

    if(updates.oldpassword && updates.password){
      const isMatch=await bcrypt.compare(updates.oldpassword,user.password);
      if(!isMatch){
        return res.json({message:"Old Password is incorrect"});
      }
      updates.password=await bcrypt.hash(updates.password,10)
    }
    else if(updates.password){
      return res.json({message:"Old passsword is required to change password"});
    }

    delete updates.oldpassword;

    const updateUser=await User.findByIdAndUpdate(
      userId,
      {$set:updates},
      {new:true}
    ).select("-password -refreshToken -___v");
    
    res.json({message:"User Updated Successfully",user:updateUser});
    }
    catch(err){
      res.status(500).json({message:err.message});
    }
  };




  const refreshAccessToken=async(req,res)=>{
    const token=req.cookies.refreshToken;
    if(!token){
      return res.status(401).json({message:"Refresh Token not found"});
    }
    try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const user=await User.findById(decoded.id);
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    const newAccessToken=generateAccessToken(user);
    res.status(201).json({accessToken:newAccessToken,});
  }
  catch(err){
    console.error("Refresh Token Error",err);
    res.status(403).json({message:"Invalid or expires refresh token"});
  }
};

  module.exports={registerUser,loginUser,logoutUser,getUserProfile,refreshAccessToken,getAllUser,updateUser,deleteUser,softdeleteUser};