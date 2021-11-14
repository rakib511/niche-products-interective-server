const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;


//middlewere
app.use(cors());
app.use(express());

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()

app.use(bodyParser.urlencoded({ extended: false }));

//database connected

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qe1gc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db('niche_products');
        const productsCollection = database.collection('products');
        const catelogsCollection = database.collection('catelogs');
        const moreProductsCollection = database.collection('moreProducts');
        const ordersCollection = database.collection('orders');
        const reviewCollection = database.collection('revew');
        const usersCollection = database.collection('users');

        //get products
        app.get('/products',async(req,res)=>{
            const result = await productsCollection.find({}).toArray();
            res.send(result);
        })
        //get moreProducts
        app.get('/moreProducts',async(req,res)=>{
            const result = await moreProductsCollection.find({}).toArray();
            res.send(result);
        })
        //get catelog products
        app.get('/catelogs',async(req,res)=>{
            const result = await catelogsCollection.find({}).toArray();
            res.send(result);
        })
        //get productDetails
        app.get('/productDetails/:id',async(req,res)=>{
            const id = req.params.id;
            const result = await productsCollection.findOne({_id:ObjectId(id)});
            res.send(result);
        })
        //get moreProductDetails
        app.get('/productDetails/:id',async(req,res)=>{
            const id = req.params.id;
            const result = await moreProductsCollection.findOne({_id:ObjectId(id)});
            res.send(result);
        })

        //add myOrder
        app.post("/addOrders",jsonParser, async (req, res) => {
            const query = req.body;
            
            const result = await ordersCollection.insertOne(query);
            // console.log(query);
            res.send(result.acknowledged);
          });

          //get myOrders
          app.get("/myOrder/:email", async (req, res) => {
            console.log(req.params.email);
            const result = await ordersCollection
              .find({ email: req.params.email })
              .toArray();
            res.send(result);
          }); 
        //delete myorder
        app.delete('/deleteOrder/:id',async(req,res)=>{
            const id = req.params.id;
            const result = await ordersCollection.deleteOne({_id:ObjectId(id)});
            res.send(result);
        })   

         //add review
        app.post("/addsReview",jsonParser, async (req, res) => {
            
            const result = await reviewCollection.insertOne(req.body);
            console.log(req.body);
            res.json(result.acknowledged);
        }); 
        //get review 
        app.get("/addsReview", async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.json(result);
        });  
         //add users
         app.post("/users",jsonParser, async (req, res) => {
            
            const result = await usersCollection.insertOne(req.body);
            console.log(result);
            res.json(result);
        }); 
        //update users
        app.put('/users',jsonParser,async(req,res)=>{
            const user = req.body;
            const filter = {email: user.email};
            const options = { upsert : true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter,updateDoc,options);
            res.send(result);
        })
        //makeAdmin
        app.put('/users/admin',jsonParser,async(req,res)=>{
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role:'admin'}};
            const result = await usersCollection.updateOne(filter,updateDoc);
            res.send(result);
        })

        //checkAdmin
        app.get('/users/:email', async(req,res)=>{
            const email = req.params.email;
            const query = {email:email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.send({admin: isAdmin});
        })

         //add servicesCollection
        app.post("/addProducts",jsonParser, async (req, res) => {
            // console.log(req.body);
            const result = await moreProductsCollection.insertOne(req.body);
            res.send(result);
        });
    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello kluke baby care!')
})

app.listen(port, () => {
  console.log(` app listening at http://localhost:${port}`)
})