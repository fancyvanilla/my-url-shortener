const express=require('express')
const mysql=require('mysql2/promise')
const axios=require('axios')
const { generateShortUrl }=require('./utils.js')

require('dotenv').config();

const app=express();

let db;
const connectDB=async ()=>{
     try{
        db=await mysql.createConnection({
             host:process.env.MYSQL_HOST,
             user:process.env.MYSQL_USER,
             password:process.env.MYSQL_PASSWORD,
             database:process.env.MYSQL_DATABASE
        })
        console.log("MySQL connected")
       }
       catch(err){
        console.log("Could not connect to MySQL",err);
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

      //check if URL exists
      await axios.get(fullUrl)

      let shortUrl= generateShortUrl()
      try {
      await db.query(
         'INSERT INTO urls (fullUrl, shortUrl, clicks) VALUES (?, ?, ?)',
         [fullUrl, shortUrl, 0]
     );

   }
   catch(err){
      res.status(500).send('DB error');
   }
      res.render("index",{
         url:{
            fullUrl:fullUrl,
            shortUrl:shortUrl,
         },
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
      const [rows] = await db.query(
         'SELECT * FROM urls WHERE shortUrl = ?',
         [shortUrl]
     );
      if ( rows.length==0 ) return res.status(404).send('URL not found')
      const url=rows[0]

     //increment clicks
      await db.query(
         'UPDATE urls SET clicks = clicks + 1 WHERE shortUrl = ?',
         [shortUrl]
     );
      res.redirect(url.fullUrl);
   }
   catch(error){
      res.status(500).send('Url not found');
   }
})

app.listen(process.env.PORT ,()=>console.log(`listening on port ${process.env.PORT}`))

