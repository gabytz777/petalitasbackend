const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let messages = [];

// Anti-spam tracking
const lastMessageTime = {};

// Send message
app.post("/send", (req, res) => {
    const { user, text, source } = req.body;

    if (!user || !text) {
        return res.status(400).json({
            error: "Missing user or text"
        });
    }

    const now = Date.now();
    const last = lastMessageTime[user] || 0;

    // 2 second cooldown
    if (now - last < 2000) {
        return res.status(429).json({
            error: "Slow down"
        });
    }

    lastMessageTime[user] = now;

    messages.push({
        user,
        text,
        source: source || "unknown",
        time: now
    });

    // Keep only newest 500 messages
    if (messages.length > 500) {
        messages.shift();
    }

    res.json({
        ok: true
    });
});

// Get messages
app.get("/messages", (req, res) => {
    res.json(messages);
});

// Optional homepage
app.get("/", (req, res) => {
    res.send("Petalitas Chat API is running.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
