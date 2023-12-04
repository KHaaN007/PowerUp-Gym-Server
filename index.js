const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 5000;





/**-----Middleware----**/
app.use(cors());
app.use(express.json())









const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { default: Stripe } = require('stripe');
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
        const trainersCollection = client.db("FitnessDB").collection("trainers")
        const classesCollection = client.db("FitnessDB").collection("classes")
        const packageBookedCollection = client.db("FitnessDB").collection("packageBooked")
        const articelCollection = client.db("FitnessDB").collection("articels")
        const paymentCollection = client.db("FitnessDB").collection("payment")











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
        /**------------------**---JWT TOKEN End---**---------------------**/


        /*****Verify Admin******/
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await userCollection.findOne(query);
            const isAdmin = user?.role === 'admin'
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next()
        }



        /*****Verify Trainer******/
        const verifyTrainer = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await userCollection.findOne(query);
            const isAdmin = user?.role === 'trainer'
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next()
        }











        /**---------------**---Admin Start---**------------------**/
        app.get('/user/admin/:email', verifyToken, async (req, res) => {
            const email = req.params?.email;
            console.log('Role Admin From Email', email);
            console.log('Role Admin From Decoded', req.decoded?.email);
            if (email !== req.decoded?.email) {
                return res.send?.status(403).send({ message: 'Unauthorized Access' })
            }

            const query = { email: email }
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin'
            }
            res.send({ admin })
        })


        /**-----------------**---Admin End---**-------------------**/





        /**--------------**---Trainer Verify Start---**----------------**/
        app.get('/user/trainer/:email', verifyToken, async (req, res) => {
            const email = req.params?.email;
            console.log('Role Trainer From Email', email);
            console.log('Role Trainer From Decoded', req.decoded?.email);
            if (email !== req.decoded?.email) {
                return res.send?.status(403).send({ message: 'Unauthorized Access' })
            }

            const query = { email: email }
            const user = await userCollection.findOne(query);
            let trainer = false;
            if (user) {
                trainer = user?.role === 'trainer'
            }
            res.send({ trainer })
        })


        /**---------------**---Trainer Verify End---**-----------------**/











        /**User Related Api**/
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result)
        })


        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'trainer',

                }
            }

            const result = await userCollection.updateOne(filter, updateDoc)
            res.send(result);
        })
        app.patch('/users/:email', async (req, res) => {
            const userInfo = req.body
            const email = req.params.email

            console.log('214', userInfo);
            console.log('215', id);
            const filter = { email: email }
            const updateDoc = {
                $set: {
                    name: userInfo.name,
                    image: userInfo.image,

                }
            }

            const result = await userCollection.updateOne(filter, updateDoc)
            res.send(result);
        })
        // Change User Role to Trainer
        // app.patch('/user/admin/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) }
        //     const updateInfo = {
        //         $set: {
        //             role: 'trainer'
        //         }
        //     }
        //     const result = await userCollection.updateOne(filter, updateInfo)
        //     res.send(result)

        // })



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
            const result = await trainersCollection.insertOne(beAtrainer)
            res.send(result)
        })

        //






        // Post Data For Be A Package Booked
        app.post('/packageBooked', async (req, res) => {
            const packageBooked = req.body;
            const result = await packageBookedCollection.insertOne(packageBooked)
            res.send(result)
        })







        // Get Trainner Data 
        app.get('/trainers', async (req, res) => {
            const result = await trainersCollection.find().toArray();
            res.send(result)
        })

        // Get Data For Trainer Details/Slots Page
        app.get('/trainerDetail/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await trainersCollection.findOne(query);
            console.log(result);
            res.send(result);
        })

        app.patch('/trainers/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            console.log('289', filter);
            const updateDoc = {
                $set: {
                    status: 'trainer',

                }
            }
            const updateDocRole = {
                $set: {
                    role: 'trainer',

                }
            }

            const trainerResult = await trainersCollection.updateMany(filter, updateDoc)
            console.log('303', trainerResult);
            const userResult = await userCollection.updateOne(filter, updateDocRole)
            console.log('304', userResult);
            res.send({ trainerResult, userResult });
        })



        // Get Data For Trainer Details/Slots Page
        // app.get('/packageDetail/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await trainersCollection.findOne(query);
        //     console.log(result);
        //     res.send(result);
        // })



        // Post Data For Classes
        app.post('/classes', async (req, res) => {
            const classes = req.body;
            const result = await classesCollection.insertOne(classes)
            res.send(result)
        })


        // Get Data For Clsses Data 
        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result)
        })


        // Get Data For Classes Details Data
        app.get('/classesDetail/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await classesCollection.findOne(query);
            console.log(result);
            res.send(result);
        })

        // Post Data For Articles
        app.post('/articles', async (req, res) => {
            const articles = req.body;
            const result = await articelCollection.insertOne(articles)
            res.send(result)
        })

        app.get('/articles', async (req, res) => {
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            const skip = (page - 1) * limit


            const result = await articelCollection
                .find()
                .skip(skip)
                .limit(limit)
                .toArray()
            const totalArticles = await articelCollection.estimatedDocumentCount();
            res.send({ result, totalArticles })



            // const result = await articelCollection.find().toArray();
            // res.send(result)
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

        app.get('/newsletter', async (req, res) => {
            const result = await newsletterCollection.find().toArray();
            res.send(result)
        })
        app.get('/payment', verifyToken, async (req, res) => {
            const result = await paymentCollection.find().toArray();
            res.send(result)
        })
        app.get('/package', verifyToken, async (req, res) => {
            const result = await packageBookedCollection.find().toArray();
            res.send(result)
        })


























        // Payment Intent 
        // payment intent
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            console.log(amount, 'amount inside the intent')

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });

            res.send({
                clientSecret: paymentIntent.client_secret
            })
        });



        // Post Payment 
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const paymentResult = await paymentCollection.insertOne(payment);

            // Carefully Delete Each Item From The Cart
            console.log('Payment Info', payment);
            // const query = {
            //     _id: {
            //         $in: payment.cartIds.map(id => new ObjectId(id))
            //     }
            // }
            // const deleteResult = await cartCollection.deleteMany(query)
            res.send({ paymentResult })
        })

        app.get('/payments/:email', verifyToken, async (req, res) => {
            const query = { email: req.params.email }
            if (req.params.email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const result = await paymentCollection.find(query).toArray();
            res.send(result);
        })


















        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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

