const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const proRouter = require('./api/routes/products');
const ordRouter = require('./api/routes/orders');
const db = 'mongodb+srv://ashuadukia511:Natrium@cluster0.hxxe3.mongodb.net/Ashutosh?retryWrites=true&w=majority';

mongoose.connect(db,
    {
        useNewUrlParser : true,
        useUnifiedTopology : true
    }
).then(() => {
    console.log('Mongoose Connected......');
}).catch((err) => {
    console.log(err);
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
})

app.use('/products', proRouter);
app.use('/orders', ordRouter);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
})

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error:{
            message:err.message
        }
    })
})

module.exports = app;

