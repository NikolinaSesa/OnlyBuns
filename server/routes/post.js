import auth from "../middlewares/auth.js";
import Post from "../models/post.js";
import express from "express";

const router = express.Router();

router.get("/getAll", async (req, res) => {
    const posts = await Post.find({}).sort({"created_at": "desc"});

    return res.status(200).send(posts);
})

router.post("/createPost", auth, async (req, res) => {
    try {
        const post = new Post({
            description: req.body.description,
            image: req.body.image,
            location: {
                x: req.body.x,
                y: req.body.y
            },
            created_at: new Date(),
            created_by: req.body.created_by,
            comments: [],
            likes: []
        });

        await post.save();
        res.status(201).send("Post created successfully.");

    } catch (error) {
        console.error(error);
        res.status(400).send("Something went wrong.");
    }
})

router.delete("/deletePost/:id", auth, async (req, res) => {
    const postId = req.params.id;
    try {
        await Post.findByIdAndDelete(postId);
        res.status(200).send("Post deleted successfully.");

    }catch(error){
        console.error(error);
        res.status(400).send("Something went wrong.");
    }
})

router.put("/updatePost", auth, async(req, res) => {
    try{
        const post = await Post.findById(req.body._id);
        post.image = req.body.image;
        post.description = req.body.description;
        post.location = req.body.location;

        const savedUpdatedPost = await post.save();
        res.status(200).send(savedUpdatedPost);

    }catch(error){
        console.error(error);
        res.status(400).send("Something went wrong.")
    }
})

router.put("/likePost", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.body.postId);
        if (!post) {
            return res.status(404).send("Post doesn't exist anymore.");
        }

        if (post.likes.find((like) => like.liked_by === req.body.liked_by)) {
            const updatedLikes = post.likes.filter((like) => like.liked_by != req.body.liked_by);
            post.likes = updatedLikes;
            const updatedPost = await post.save();

            delete updatedPost.image;
            return res.status(200).send(updatedPost);
        }

        const like = {
            liked_by: req.body.liked_by,
            liked_at: new Date()
        }

        post.likes.push(like);
        const updatedPost = await post.save();

        delete updatedPost.image;
        return res.status(200).send(updatedPost);

    } catch (error) {
        console.error(error);
        res.status(400).send("Something went wrong.");
    }
})

router.put("/commentPost", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.body.postId);
        if (!post) {
            return res.status(404).send("Post doesn't exist anymore.");
        }

        const comment = {
            created_by: req.body.created_by,
            text: req.body.text,
            created_at: new Date()
        }

        post.comments.push(comment);
        const updatedPost = await post.save();

        delete updatedPost.image;
        return res.status(200).send(updatedPost);

    } catch (error) {
        console.error(error);
        res.status(400).send("Something went wrong.");
    }
})

export default router;