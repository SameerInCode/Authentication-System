
 const express = require("express");
 const app=express();
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
//const mongoSanitize = require("express-mongo-sanitize");
 const dotenv = require("dotenv");
 const authroutes=require("./routes/authroutes");
 const adminroute=require("./routes/adminroute");
 const path = require("path");

 
dotenv.config();
app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/login",(req,res)=>{
  res.sendFile(path.join(__dirname,"public","login.html"));
});

app.get("/profile",(req,res)=>{
  res.sendFile(path.join(__dirname,"profile.html"));
})

app.use(cors({
  origin:"http://localhost:5007",
  credentials:true
}));
app.use(helmet());
app.use(cookieParser());

//app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 150,
});
app.use(limiter);



app.use("/api/auth",authroutes);
app.use("/api/admin",adminroute);
 
app.get("/", (req, res) => {
  res.send("Auth System API is running");
});

app.listen(process.env.PORT, () => {
  console.log(`App is listening on Localhost live on ${process.env.PORT}`);
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MONGODB");
  })
  .catch((err) => {
    console.error("MONGODB connection Failed", err.message); 
  });

