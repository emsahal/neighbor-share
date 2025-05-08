const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { json } = require('express');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    const {name, email, password, role, location } = req.body;
    
    try {
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: 'User already exists.'})
        } 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name, 
            email,
            password: hashedPassword,
            role,
            location
        });

        await user.save();

        const payload = {id: user._id, email: user.email};
        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});
        
        res.status(201).json({token,user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location
        }});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid Credentials.'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {id: user._id, email: user.email};
        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});

        res.json({token, user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location
        }});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}