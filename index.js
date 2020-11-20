const { on } = require("process");
var os = require("os-utils");
var os2 = require("os");
const disk = require("diskusage");
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

let path = os2.platform() === "win32" ? "c:" : "/";

io.on("connection", (socket) => {
  console.log("Got connect!");

  let interval = setInterval(() => {
    os.cpuUsage(function (v) {
      socket.emit("cpu", (v * 100).toFixed(1));
    });
    socket.emit("mem", ((os2.freemem / os2.totalmem) * 100).toFixed(1));
    disk
      .check(path)
      .then((info) =>
        socket.emit("disk", ((info.free / info.total) * 100).toFixed(1))
      )
      .catch((err) => console.error(err));
  }, 300);

  socket.on("msg", function (data) {
    console.log(data);
    socket.emit("cpu", "null");
  });

  socket.on("disconnect", function () {
    clearInterval(interval);
    console.log("Got disconnect!");
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

server.listen(1234);
