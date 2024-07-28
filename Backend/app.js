const dotenv=require('dotenv').config()
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const jwt=require('jsonwebtoken');
const  mongoose=require('mongoose');
const User=require('./Models/users');
const {hashPassword,comparePassword}=require('./Helpers/auth')
const {spawn} = require('child_process');
const app = express();
const port=process.env.PORT|| 3000; 
mongoose.connect(process.env.mongo_url)
  .then(() => console.log("DB connected"))
  .catch((err) => {
    console.error("DB connection error:", err);
  });
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

app.use(cors());


app.get('/profile',(req,res)=>{
    const {token}=req.headers;
    if(token){
      jwt.verify(token,process.env.JWT_SECRET,{},(err,user)=>{
        if(err)console.log(err);
        res.json(user);
      })
    }else{res.json(null);}

})

app.get('/posts',async(req,res)=>{
  const {token}=req.headers;
  try{
    jwt.verify(token,process.env.JWT_SECRET,{},async(err,user)=>{
      if(err)console.log(err);
      const userDoc = await User.findOne({ email: user.email });
      if (!userDoc) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({posts:userDoc.posts});
    })
  }catch (e){console.log("Invalid Token");}
})
app.post('/register',async (req,res)=>{
  try{
    const {name,email,password}=req.body;
    if(password.length<6){
      return res.json({
        error:"Password must be atleast 6 characters long"
      })
    };
    const exist=await User.findOne({email});
    if(exist){
      return res.json({
        error:"User already Exists"
      })
    };
    const hashedPassword=await hashPassword(password);
    const user=await User.create({
      name,email,password:hashedPassword
    })
    const token=jwt.sign({email:user.email,name:user.name},process.env.JWT_SECRET);
          
    res.json({user:token});

  }catch(err){
      console.log(err);
  }
})

app.post('/login',async (req,res)=>{
  try{
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(!user){return res.json({error:"Invalid Credentials"});}
    else{
      const match=await comparePassword(password,user.password);
      if(match){

          const token=jwt.sign({email:user.email,name:user.name},process.env.JWT_SECRET);
          
          res.json({user:token});
      }else {res.json({error:"Invalid Credentials"});
    }}

  }catch(err){
      console.log(err);
  }
})
app.post('/summarize', (req, res) => {
  const { url } = req.body;
  const pyProg = spawn('python', ['./app.py', url]);
  let summ = "";
  let error = "";

  pyProg.stdout.on('data', (data) => {
    summ += data.toString();
  });

  pyProg.stderr.on('data', (data) => {
    error += data.toString();
  });

  pyProg.on('close', (code) => {
    res.json({ summary: summ, error: error });
  });
});

app.post('/save-summary', async (req, res) => {
  const { token } = req.headers;
  const { post } = req.body;
  try {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) console.log(err);
      const userDoc = await User.findOne({ email: user.email });
      if (!userDoc) {
        return res.status(404).json({ error: "User not found" });
      }
      const newSummary = { id: uuidv4(), text: post };
      userDoc.posts.push(newSummary);
      await userDoc.save();
      res.json({ newSummary });
    });
  } catch (e) {
    console.log("Invalid Token");
  }
});
app.delete('/delete-summary', async (req, res) => {
  const { token } = req.headers;
  const { summaryId } = req.body;

  try {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) {
        return console.log(err);
      }

      const userDoc = await User.findOne({ email: user.email });
      if (!userDoc) {
        return res.status(404).json({ error: "User not found" });
      }

      userDoc.posts = userDoc.posts.filter(post => post.id !== summaryId);
      await userDoc.save();
      res.json({ success: true, posts: userDoc.posts });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
