const express=require("express");
const allowroles=require("../middlewares/roleMiddleware");
const verifyAcessToken=require("../middlewares/verifyTokenMiddleware");
const {getAllUser,deleteUser,softdeleteUser}=require("../controllers/authController");
const router=express.Router();

router.get("/dashboard",verifyAcessToken,allowroles("admin"),(req,res)=>{
  res.json({message:`Welcome Admin ${req.user.name}`,
  user:req.user});
});

router.get("/users",verifyAcessToken,allowroles("admin"),getAllUser);
module.exports=router;

router.delete("/users/:id",verifyAcessToken,allowroles("admin"),deleteUser);
router.delete("/softdeluser/:id",verifyAcessToken,allowroles("admin"),softdeleteUser);