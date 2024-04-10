const express=require('express')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
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

   const url=new Url({fullUrl:req.body.fullUrl});
   await url.save();
   res.redirect('/');
}
catch(err){
   res.status(500).send('Internal URL');
}

});


app.get('/',async (req,res)=>{
   try{
      const urls=await Url.find();
      res.render('index',{urls})
   }
   catch(err){
      res.status(500).send('Internal server error');
   }

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