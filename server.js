const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let messages = [];
let lastMessageTime = {};

/* =========================
   SEND MESSAGE
========================= */
app.post("/send", (req, res) => {
    const { user, text, source } = req.body;

    // 🔍 DEBUG: shows exactly what arrives
    console.log("RECEIVED BODY:", req.body);

    if (!user || !text) {
        return res.status(400).json({ error: "Missing user or text" });
    }

    const now = Date.now();
    const last = lastMessageTime[user] || 0;

    // anti-spam cooldown
    if (now - last < 2000) {
        return res.status(429).json({ error: "Too fast" });
    }

    lastMessageTime[user] = now;

    const msg = {
        user: user.trim(),
        text: text.trim(),

        // 🔥 THIS IS THE FIX (never becomes undefined)
        source: source ? source.trim() : "unknown",

        time: now
    };

    console.log("SAVED MESSAGE:", msg);

    messages.push(msg);

    // keep memory small
    if (messages.length > 500) {
        messages.shift();
    }

    res.json({
        ok: true,
        message: msg
    });
});

/* =========================
   GET MESSAGES
========================= */
app.get("/messages", (req, res) => {
    res.json(messages);
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
    res.send("Chat API running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
