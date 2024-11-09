import auth from "../middlewares/auth.js";
import Notice from "../models/notice.js";
import express from "express";

const router = express.Router();

router.get("/getAll", async (req, res) => {
    const notices = await Notice.find({});

    return res.status(200).send(notices);
})

router.post("/createNotice", auth, async (req, res) => {
    
})

export default router;