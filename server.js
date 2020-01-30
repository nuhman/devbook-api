require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./api/routes/users');
const profile = require('./api/routes/profile');
const posts = require('./api/routes/posts');


const app = express();
const db_uri = process.env.MONGODB_URI;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect(db_uri)
    .then(() => console.log("db connected!"))
    .catch(err => console.log("db connection failed: " + err));

app.use(passport.initialize());
require('./passport.config')(passport);


app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`running server on port ${port}`));