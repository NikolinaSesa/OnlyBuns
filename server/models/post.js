import { Double } from "mongodb";
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    created_by: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const LikeSchema = new mongoose.Schema({
    liked_by: {
        type: String,
        required: true
    },
    liked_at: {
        type: Date,
        default: Date.now
    }
});

const PostSchema = new mongoose.Schema({
    description: {
        type: String,
    },

    image: {
        type: String
    },

    location: {
        type: Object,
        properties: {
            x: {
                type: Double
            },

            y: {
                type: Double
            }
        }
    },

    created_at: {
        type: Date
    },

    created_by: {
        type: String
    },

    comments: [CommentSchema],
    likes: [LikeSchema]
})

const Post = mongoose.model("Post", PostSchema);

export default Post;