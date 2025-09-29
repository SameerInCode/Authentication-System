const jwt=require("jsonwebtoken");

const verifyAcessToken= (req,res,next)=>{
  const authHeader=req.headers.authorization;

  if(!authHeader||!authHeader.startsWith("Bearer ")){
    return res.status(401).json({message:"Access denied NO token provided"});
  }
  const token=authHeader.split(" ")[1];
  try{
    const decode=jwt.verify(token,process.env.JWT_SECRET);
    req.user=decode;
    next();
  }
  catch(err){
    res.status(403).json({message:"Invalid or expired Token"});
  }
};

module.exports=verifyAcessToken;