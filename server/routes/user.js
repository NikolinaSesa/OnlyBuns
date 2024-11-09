import bcrypt from "bcrypt";
import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/user.js";

const router = express.Router();
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

router.post('/register', async (req, res) => {
    try {
        let user = await User.findOne({ username: req.body.username });
        if (user) {
            return res.status(400).send("Action blocked: User with provided username already exists.");
        }

        user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).send("Action blocked: User with provided email already exists.");
        }

        user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            active: false,
            address: {
                address: req.body.address,
                number: req.body.number,
                city: req.body.city
            }
        })

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();

        const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        const verificationLink = `${process.env.BASE_URL}/api/user/verify/${verificationToken}`;

        const mailOptions = {
            from: "onlyBuns@gmail.com",
            to: user.email,
            subject: 'Please Confirm Your Email Address',
            html: `
            <h3>Welcome to our platform, ${user.first_name} ${user.last_name}!</h3>
            <p>To complete your registration, please click on the link below to verify your email:</p>
            <a href="${verificationLink}">Verify Email</a>
        `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).send("User registered successfully. Please check you email to verify account.");

    } catch (error) {
        console.error(error);
        return res.status(400).send("Something went wrong.");
    }
})

router.get("/verify/:token", async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).send("Action blocked: Invalid verification link.");
        }

        user.active = true;
        await user.save();

        return res.status(200).send("User verified successfully.");

    } catch (error) {
        console.error(error);
        return res.status(400).send("Action blocked: Invalid verification link.");
    }
})

router.post("/login", async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send("Invalid email or password.");
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send('Invalid email or password.');

        if(!user.active){
            return res.status(404).send("Action Blocked: Your account is not yet activated. Please check your email and verify your registration to activate your account.");
        }

        const token = user.generateAuthToken();
        return res.status(200).send(token);

    } catch (error) {
        console.error(error);
        return res.status(400).send("Something went wrong.");
    }
})

export default router;