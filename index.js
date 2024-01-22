const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()


app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('welcome to my server')
})

// 
// 


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://houseRental:yFLiWxJjgBmbIsSn@cluster0.8mn4lkn.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const usersCollection = client.db("houseRental").collection("users");


        app.post('/users', async (req, res) => {
            const newUser = req.body
            const query = { email: newUser.email }
            const isExist = await usersCollection.findOne(query)
            if (isExist) {
                return res.send({ message: "AllReady Exist" })
            }
            const result = await usersCollection.insertOne(newUser)
            res.send(result)

        })


        app.post('/', async (req, res) => {
            const userInfo = req.body
            console.log(userInfo)
            const token = jwt.sign(userInfo, process.env.TOKEN_SECRET, { expiresIn: "1h" })
            console.log(token)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`server start on  port ${port}`)
})