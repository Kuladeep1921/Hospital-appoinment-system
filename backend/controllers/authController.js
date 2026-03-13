const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
    try {
        const { name, age, gender, phone, email, password } = req.body;

        if (!name || !age || !gender || !phone || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = await User.create({ name, age, gender, phone, email, password });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Support login by email or phone
        const user = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { phone: email }],
        });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc   Get logged in user profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
};

module.exports = { register, login, getMe };
