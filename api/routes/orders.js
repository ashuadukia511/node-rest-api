const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/orders');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find().select('_id product quantity').populate('product', 'name price').then(results => {
        console.log(results);
        const response = {
            message : 'Handler for GET request',
            count : results.length,
            orders : results.map(result => {
                return {
                    _id : result._id,
                    product : result.product,
                    quantity : result.quantity,
                    request : {
                        type : 'GET',
                        url : 'https://localhost:8888/orders/'+result._id
                    }
                }
            })
        }
        res.status(200).json(response);
    }).catch(err => {
        console.log(err);
        res.status(500).json({error : err});
    });
    
});

router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id).select('_id product quantity').populate('product').then(result => {
        if(result){
            res.status(200).json({
                message : 'Handle for GET request',
                order : result,
                request : {
                    type : 'GET',
                    url : "https://localhost:8888/orders/"+id
                }
            });
        }
        else {
            res.status(404).json({error : 'Order Not Found'});
        }
    }).catch(err => {
        res.status(500).json({error : err});
    });
});

router.post('/', (req, res, next) => {
    const productId = req.body.product;
    Product.findById(productId).then(product => {
        if(product){
            const order = new Order({
                _id : mongoose.Types.ObjectId(),
                product : productId,
                quantity : req.body.quantity
            });
            return order.save()
        } else {
            res.status(404).json({error : 'Product Not Found'});
        }
    }).then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Order Created',
            createdOrder : {
                _id : result.id,
                product : productId,
                quantity : result.quantity
            },
            request : {
                type : 'GET',
                url : 'https://localhost:8888/orders/'+result._id
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
    
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({_id :id}).then(result => {
        console.log(result);
        res.status(200).json({
            message : 'Order Deleted',
            request : {
                type : 'POST',
                url : 'https://localhost:8888/orders'
            }
        })
    }).catch(err => {
        res.status(500).json({
            error : err
        })
    });
});
module.exports = router;