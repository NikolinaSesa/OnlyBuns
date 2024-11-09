import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },

    last_name: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    active: {
        type: Boolean
    },

    address: {
        type: Object,
        required: true,
        properties: {
            address: {
                type: String,
                required: true
            },
            number: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            }
        }
    }
});

UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET ?? "")
}

const User = mongoose.model("User", UserSchema);

export default User;