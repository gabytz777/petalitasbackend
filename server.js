const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let messages = [];
const lastMessageTime = {}; // anti-spam

// SEND MESSAGE
app.post("/send", (req, res) => {
    const { user, text } = req.body;

    const now = Date.now();
    const last = lastMessageTime[user] || 0;

    // 2 second cooldown
    if (now - last < 2000) {
        return res.status(429).json({ error: "Too fast" });
    }

    lastMessageTime[user] = now;

    messages.push({
        user,
        text,
        time: now
    });

    res.json({ ok: true });
});

// GET MESSAGES
app.get("/messages", (req, res) => {
    res.json(messages);
});

app.listen(3000, () => console.log("Server running"));
