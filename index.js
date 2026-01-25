const http = require("http");
const PORT = 3000

const server = http.createServer((req, res) => {
    res.write("hello");
    res.end();
});

server.listen(PORT, () => {
    console.log("server is running...")
    console.log()
})