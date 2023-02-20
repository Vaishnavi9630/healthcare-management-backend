const express = require('express');
const connectDb = require('./config/db');
const cors = require('cors');
const app = express();
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST);
const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())

connectDb();
app.use(cors());

app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('API running'));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))