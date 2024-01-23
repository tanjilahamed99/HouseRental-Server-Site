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


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const houseCollection = client.db("houseRental").collection("house");


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


        app.post('/jwt', async (req, res) => {
            const userInfo = req.body
            const token = jwt.sign(userInfo, process.env.TOKEN_SECRET, { expiresIn: "1h" })
            res.send({ token })

        })

        app.post('/role', async (req, res) => {
            const email = req.body.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result.role)
        })

        // house related APi
        app.post('/myHouse', async (req, res) => {
            const newHouse = req.body
            const result = await houseCollection.insertOne(newHouse)
            res.send(result)
        })

        app.get('/myHouse/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await houseCollection.find(query).toArray()
            return res.send(result)
        })

        app.delete('/myHouse/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await houseCollection.deleteOne(query)
            return res.send(result)
        })

        app.get('/updateHouse/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await houseCollection.findOne(query)
            return res.send(result)
        })

        app.patch('/myHouse/:id', async (req, res) => {

            const id = req.params.id
            const updatedData = req.body
            const query = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    address: updatedData.address,
                    city: updatedData.city,
                    bedrooms: updatedData.bedrooms,
                    bathrooms: updatedData.bathrooms,
                    roomSize: updatedData.roomSize,
                    picture: updatedData.picture,
                    availabilityDate: updatedData.availabilityDate,
                    rent: updatedData.rent,
                    phoneNumber: updatedData.phoneNumber,
                    desc: updatedData.desc
                }
            }
            const result = await houseCollection.updateOne(query, updatedDoc)
            return res.send(result)

        })

        // all house data
        app.get('/allHouse', async (req, res) => {
            const query = req.query
            const city = query.city
            const bedrooms = query.bedrooms
            const availability = query.availability
            const roomSize = query.roomSize
            const roomPrice = query.roomPrice


            const sortObj = {}

            if (roomSize !== '' || roomSize === "undefine") {
                sortObj.roomSize = roomSize
            }
            if (roomPrice !== '' || roomSize === "undefine") {
                sortObj.rent = roomPrice
            }

            console.log(sortObj)

            const filter = {}

            if (city) {
                filter.city = city
            }
            if (bedrooms) {
                filter.bedrooms = bedrooms
            }
            if (availability !== "undefined") {
                if (availability === 'true') {
                    filter.open = true
                } else {
                    filter.open = false
                }
            }

            const result = await houseCollection.find(filter).sort(sortObj).toArray()
            return res.send(result)
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