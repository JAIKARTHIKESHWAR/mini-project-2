import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Assuming you have a User model
            index: true
        },
        title: {
            type: String,
            default: "New Chat",
        }
    },
    { timestamps: true, collection: "chat_sessions" }
);

export default mongoose.model("ChatSession", chatSessionSchema);
