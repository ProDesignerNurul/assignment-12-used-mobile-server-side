const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;



// middleware 
app.use(cors());
app.use(express.json());




// db codeed 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zwnyjff.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized')
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded) {
        if(err) {
            return res.status(403).send({message: 'forbidden access'})
        }

        req.decoded = decoded;
        next();
    })

}



async function run() {
    try {
        const usedMobileCollection = client.db('usedMobileResaler').collection('usedMobiles');
        const categoryCollection = client.db('usedMobileResaler').collection('mobileCategory');
        const bookingsCollection = client.db('usedMobileResaler').collection('bookings');
        const usersCollection = client.db('usedMobileResaler').collection('users');


        // category 
        app.get('/mobileCategory', async (req, res) => {
            const query = {};
            const mobileCategory = await categoryCollection.find(query).toArray();
            res.send(mobileCategory);
        });


        // bookings collection 
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;

            // if(email !== decodedEmail){
            //     return res.status(403).send({message: 'forbidden access'})
            // }

            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })


        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })







        // all mobiles 
        app.get('/allItems', async (req, res) => {
            const query = {};
            const allItems = await usedMobileCollection.find(query).toArray();
            res.send(allItems);
        })

        app.get('/showAllMobile/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: ObjectId(id) };
            const allMobiles = await usedMobileCollection.find(query).toArray();
            res.send(allMobiles);
        });


        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const mobileCategory = await usedMobileCollection.find(query).toArray();
            res.send(mobileCategory);
        });



        // jwt 
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user) {
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                return res.send({accessToken: token})
            }
            res.status(403).send({accessToken: ''});
        })


        // users 
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })




        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });



        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id)};
            const options = { upsert: true};
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })



    }

    finally {

    }
};
run().catch(err => console.error(err));






// server testing
app.get('/', (req, res) => {
    res.send('server is running now');
});


app.listen(port, () => {
    console.log(`server is running now on port ${port}`)
})