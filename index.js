const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;



// middleware 
app.use(cors());
app.use(express.json());








// server testing
app.get('/', (req, res) => {
    res.send('server is running now');
});


app.listen(port, () => {
    console.log(`server is running now on port ${port}`)
})