const express=require("express");

const {registerUser,loginUser,logoutUser, refreshAccessToken}=require("../controllers/authController");
const {getUserProfile,updateUser}=require("../controllers/authController");
const verifyToken=require("../middlewares/verifyTokenMiddleware");
const router=express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",logoutUser);
router.get("/refresh-token",refreshAccessToken);
router.get("/profile",verifyToken,getUserProfile);
router.put("/update",verifyToken,updateUser);
module.exports=router;
