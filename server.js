require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');


const users = require('./routes/users');
const profile = require('./routes/profile');
const posts = require('./routes/posts');


const app = express();
const db_uri = process.env.MONGODB_URI;


mongoose.connect(db_uri)
    .then(() => console.log("db connected!"))
    .catch(err => console.log("db connection failed: " + err));

app.get('/', (req, res) => {
    res.send("hello world");
});


app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`running server on port ${port}`));