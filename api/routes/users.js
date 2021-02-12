const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/users');

router.post('/signup', (req, res, next) => {
    User.find({email : req.body.email}).then(result => {
        if(result.length >= 1){
           return res.status(422).json({
                message : "Mail Exists"
            });
        } else{
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    res.status(500).json({
                        message : "Hashing Error"
                    });
                } else{
                    const user = new User({
                        _id : mongoose.Types.ObjectId(),
                        email : req.body.email,
                        password : hash
                    });

                    user.save().then(resp => {
                        console.log(resp);
                        res.status(201).json({
                            message : "User Created",
                            user : resp
                        });
                    }).catch(err => {
                        res.status(500).json({
                            error : err,
                            message : "Error in Saving to the Database"
                        })
                    });
                }
            });
        }
    }).catch(err => {
        res.status(500).json({
            error : err,
            message : "Error in Finding the Database"
        })
    })
    
});

router.post('/login', (req, res, next) => {
    User.find({email : req.body.email}).then(user => {
        if(user.length < 1){
            return res.status(401).json({
                message : "Bad Auth"
            });
        } else {
            bcrypt.compare(req.body.password, user[0].password, (err , result) => {
                if(err){
                    return res.status(401).json({
                        message : "Bad Auth"
                    });
                }

                if(result){
                    const token = jwt.sign({
                        email : user[0].email,
                        userId : user[0]._id
                    },process.env.JWT_KEY, {
                        expiresIn : "1h"
                    })                    
                    return res.status(200).json({
                        message : "Auth Successful",
                        token : token
                    });
                }

                res.status(401).json({
                    message : "Bad Auth"
                });
            });
        }
    }).catch(err => {
        res.status(500).json({
            error : err,
            message : "Error Checking the Database"
        })
    });
});

router.delete('/:userId', (req, res, next) => {
    const id = req.params.userId;
    User.deleteOne({_id : id}).then(result => {
        res.status(200).json({
            message : "User Deleted",
            response : result
        })
    }).catch(err => {
        res.status(500).json({
            error : err,
            message : "Error Deleting User "
        })
    }) 
});
module.exports = router;