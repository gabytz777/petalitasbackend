const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let messages = [];
let lastMessageTime = {};

/* SEND MESSAGE */
app.post("/send", (req, res) => {
    const { user, text, source } = req.body;

    if (!user || !text) {
        return res.status(400).json({ error: "Missing data" });
    }

    const now = Date.now();
    const last = lastMessageTime[user] || 0;

    if (now - last < 2000) {
        return res.status(429).json({ error: "Too fast" });
    }

    lastMessageTime[user] = now;

    messages.push({
        user,
        text,
        source: source || "unknown",
        time: now
    });

    if (messages.length > 500) messages.shift();

    res.json({ ok: true });
});

/* GET MESSAGES */
app.get("/messages", (req, res) => {
    res.json(messages);
});

/* ROOT */
app.get("/", (req, res) => {
    res.send("Chat API running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on " + PORT));
