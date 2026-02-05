const http = require("http");
const PORT = 3000
const express = require("express")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())

app.post("/pages/registration_page", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "missing email or password" })
    }
    return res.status(201).json({
        ok: true,
        user: { id: "u1", email }
    })
})


const server = http.createServer((req, res) => {
    res.write("hello");
    res.end();
});

server.listen(PORT, () => {
    console.log("server is running...")
    console.log()
})