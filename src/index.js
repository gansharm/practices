const port = 4000;
const express = require("express")
const app = express()
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const multer = require("multer")
const path = require("path")
const cors = require("cors");
const { error } = require("console");

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/test",{
    
}).then(()=>{
    console.log("connection successful")
}).catch((e)=>{
    console.log("No Connection");
})

const Collection = new mongoose.model('items',{
    id:{
     type:Number,
     required:true
    },
    name:{
     type:String,
     required:true
    },
    image:{
     type:String,
     required:true
    },
    category:{
     type:String,
     required:true
    },
    new_price:{
     type:Number,
     required:true
    },
    old_price:{
     type:Number,
     required:true
    },
    date:{
     type:Date,
     default:Date.now,
    },
    available:{
     type:Boolean,
     default:true
    }
 
 })
 

app.get("/",(req,res)=>{
    res.send("express app is running")
})

const storage = multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
    return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({storage:storage})
app.use("/images",express.static('upload/images'))
app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

app.post('/addproducts', async (req,res)=>{
    let products = await Collection.find({})
    let id;
     if(products.length>0){
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      id = last_product.id+1;
    }else{
      id=1;
    }
    const product = Collection({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price
    })
    console.log(product)
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name
    })
})

app.post('/removeproduct', async (req,res)=>{
 await Collection.findOneAndDelete({id:req.body.id})
 console.log("Removed")
 res.json({
    success:true,
    name:req.body.name
 })
})

app.get('/allproduct', async (req,res)=>{
    let products = await Collection.find({});
    console.log("All Products Fetched");
    res.send(products)
})

const Users =  mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object, 
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

app.post("/signup", async (req,res)=>{
    let check = await Users.findOne({email:req.body.email})
    if(check)
    {
        return res.status(404).json({
            success:false,
            errors:"Existing user is found with same email address"
        })
    }
    let cart = {};
    for(let i =0 ; i < 300 ;i++)
    {
        cart[i] = 0
    }
    
    const user = new Users({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        cartData:cart
    })
    await user.save();
    const data = {
        user:{
           id:user.id
        }
     }
  
     const token = jwt.sign(data,'secret_ecom');
     res.json({success:true,token})
})

app.listen(port,()=>{
    console.log(`Server is running on ${port}`)
})