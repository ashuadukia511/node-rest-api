const express = require('express');
const  mongoose  = require('mongoose');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename : (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' ){
        cb(null, true);
    }else {
        cb(new Error('Wrong File Type'), false);
    }
};
const upload = multer({
    storage : storage,
    limits : {
        fileSize : 1024 * 1024 * 10
    },
    fileFilter : fileFilter
});

const Product = require('../models/product.js');

router.get('/', (req, res, next) =>{
    Product.find().select('name price _id productImage').then((results) => {
        console.log(results);
        const response = {
            count : results.length,
            products : results.map(result => {
                return {
                    name : result.name,
                    price : result.price,
                    _id : result._id,
                    productImage : result.productImage,
                    request : {
                        type : 'GET',
                        url : 'https://localhost:8888/products/'+result._id
                    }
                }
            })
        };
        res.status(200).json(response);
    }).catch((err) => {
        console.log(err);
        res.status(500).json({error : err});
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).then((result) => {
        console.log('From Database', result);
        if(result){
            const response = {
                name : result.name,
                price : result.price,
                _id : id,
                productImage:result.productImage,
                request : {
                    type : 'GET',
                    url : 'https://localhost:8888/products/'+id
                }
            }
            res.status(200).json(response);
        } else{
            res.status(404).json({
                error : "No Entry Found in the Database"
            });
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).json({error : err});
    })
});


router.post('/', upload.single('productImage') ,(req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id : new mongoose.Types.ObjectId(),
        name : req.body.name,
        price : req.body.price,
        productImage : req.file.path
    });
    product.save().then((result => {
        console.log(result);
        res.status(201).json({
            message : "Created Succesfully",
            createdProduct : {
                _id : result._id,
                name : result.name,
                price : result.price,
                request : {
                    type : 'GET',
                    url : 'https://localhost:8888/products/'+result._id
                }
            }
        });
    })).catch((err => {
        console.log(err);
        res.status(500).json({
            error : err
        })
    }));
    
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id:id}).then((results) => {
        console.log(results);
        res.status(200).json({
            message : 'Product Removed',
            removedProduct : results,
            request : {
                type : 'POST',
                url : 'https://localhost:8888/products'
            }
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).json({error : err});
    });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateParams = {};
    for(const param of req.body){
        updateParams[param.propName] = param.value;
    }
    Product.updateOne({_id : id}, {$set : updateParams}).then((result) => {
        console.log(result);
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.status(500).json({error : err});
    });
});

module.exports = router;