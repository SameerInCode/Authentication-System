const jwt=require("jsonwebtoken");
const generateAccessToken=(user)=>{
  return jwt.sign(
    {id:user._id,role:user.role,name:user.name},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRE}
  );
};

const generateRefreshToken=(user)=>{
  return jwt.sign(
    {id:user._id},
    process.env.JWT_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRE}
  );
};

module.exports={
 generateAccessToken,
 generateRefreshToken,
};