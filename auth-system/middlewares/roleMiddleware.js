const allowroles=(...roles)=>{
  return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
      return res.json({messege:"Acees denied:Admin only"});
    }
    next();
  };
};

module.exports=allowroles;