const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0i8x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

async function run() {
    try {
        await client.connect();
        const database = client.db('interior_design');
        const usersCollection = database.collection('users');
        const servicesCollection = database.collection('services');
        const ordersCollection = database.collection('orders');
        // add user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(result)
            // console.log(user);
        })

        //add service
        app.post('/addServices', async (req, res) => {
            const user = req.body;
            const result = await servicesCollection.insertOne(user)
            res.json(result)
            // console.log(user);
        })
        //find 
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.json(services);
        })

        app.post('/order', async (req, res) => {
            const appointment = req.body;
            const result = await ordersCollection.insertOne(appointment);
            res.json(result)
        });

        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = { $set: { payment: payment } };
            const result = await ordersCollection.updateOne(filter, updateDoc); res.json(result);
        });


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            });
            res.json({ clientSecret: paymentIntent.client_secret })
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const cursor = await servicesCollection.findOne(filter);
            // console.log(cursor)
            res.json(cursor)

        })
        app.post('/service/booking', async (req, res) => {
            const details = req.body;
            console.log(details)
            const result = await ordersCollection.insertOne(details);
            res.send(result)
        })
        app.get('/dashboard/myOrder/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await ordersCollection.find(filter).toArray();
            res.json(result);
            // console.log(result)

        })
        app.get('/dashboard/myOrder/payment/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await ordersCollection.findOne(filter);
            res.json(result);
            console.log(id)

        })
    }


    finally {
        // await client.close();
    }
}








run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Hello this interior-design!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})