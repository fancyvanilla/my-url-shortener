const express=require('express')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const axios=require('axios')
dotenv.config();

const Url= require('./models/urlModel');
const app=express();


const connectDB=async ()=>{
     try{
        await mongoose.connect(process.env.MONGO_URI) 
        console.log("mongoDB connected")
       }
       catch(err){
        console.log("Could not connect to mongoDB",err);
        process.exit(1);
       }
}


connectDB();


app.set('view engine','ejs')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));


app.post('/shorten',async (req,res)=>{
try{
   try{
   let fullUrl= req.body.fullUrl 
   await axios.get(fullUrl)
   const url=new Url({fullUrl:fullUrl});
   await url.save();
   res.render("index",{
      url:url,
      error:""
   });
}
catch(err){
   res.render("index",{url:null,error:"Invalid URL"});
}
}
catch(err){
   res.status(500).send('Internal error');
}
});


app.get('/',async (req,res)=>{
      res.render('index',{url:null,error:""})
});

app.get('/:shortUrl',async (req,res)=>{
   try{
      const shortUrl=req.params.shortUrl;
      const url=await Url.findOne({shortUrl});
      if (!url) return res.status(404).send('URL not found')

      url.clicks++;
      url.save();
      res.redirect(url.fullUrl);
   }
   catch(error){
      res.status(500).send('Url not found');
   }
})


app.listen(process.env.PORT ,()=>console.log('listening on port 7000'))