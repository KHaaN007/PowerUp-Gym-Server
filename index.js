const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
require("dotenv").config();
const port = process.env.PORT || 5000;





/**-----Middleware----**/
app.use(cors());
app.use(express.json())









const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qgvyj9c.mongodb.net/?retryWrites=true&w=majority`;

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



        const userCollection = client.db("FitnessDB").collection("users")
        const reviewCollection = client.db("FitnessDB").collection("reviews")
        const newsletterCollection = client.db("FitnessDB").collection("newsletter")
        const beAtrainerCollection = client.db("FitnessDB").collection("beAtrainer")
        const trainersCollection = client.db("FitnessDB").collection("trainers")











        /**---------------------**---JWT TOKEN Start---**-----------------------**/


        //*********JWT Related Api*****//
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            // console.log(token);
            res.send({ token })
        })


        //**---Middlewares---**//
        const verifyToken = (req, res, next) => {
            console.log('Inside Verify Token', req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'Forbidden Access' })
            }

            const token = req.headers.authorization.split(' ')[1];

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'Forbidden Access' })
                }
                req.decoded = decoded;
                next();
            })

        }
        /**---------------------**---JWT TOKEN End---**-----------------------**/




        /**User Related Api**/


        app.post('/users', async (req, res) => {
            const user = req.body;

            // Insert Email if user doesnt exists//


            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)

            if (existingUser) {
                return res.send({ message: 'User Already Exists', insertedId: null })
            }

            const result = await userCollection.insertOne(user)
            res.send(result)
        })




        // Post Data For Be A Trainer
        app.post('/beAtrainer', async (req, res) => {
            const beAtrainer = req.body;
            const result = await beAtrainerCollection.insertOne(beAtrainer)
            res.send(result)
        })



        app.get('/trainers', async (req, res) => {
            const result = await trainersCollection.find().toArray();
            res.send(result)
        })












        /**Review And Testiomonial Related Api**/

        //Get Review Form Review Collection
        app.get('/review', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result)
        })



        //Insert Into newsletter Collection 

        app.post('/newsletter', async (req, res) => {
            const cartItem = req.body;
            const result = await newsletterCollection.insertOne(cartItem)
            res.send(result)
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










/**-----Routes----**/
app.get('/', (req, res) => {
    res.send('Mern Stack Website Is Running')
})

app.listen(port, () => {
    console.log(`Mern stack Website Server IS Running on Port ${port}`);
})

