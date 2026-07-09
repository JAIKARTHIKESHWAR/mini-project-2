import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChatSession",
            required: true,
            index: true
        },
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        showNearbyMap: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true, collection: "chat_messages" }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
