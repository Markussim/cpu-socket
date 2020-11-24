const { on } = require("process"),
 os = require("os-utils"),
 os2 = require("os"),
 disk = require("diskusage"),
 si = require("systeminformation"),
 app = require("express")(),
 server = require("http").createServer(app),
 io = require("socket.io")(server),
 port = 1234;

let path = os2.platform() === "win32" ? "c:" : "/";

io.on("connection", (socket) => {
  console.log("Got connect!");

  let interval = setInterval(() => {
    os.cpuUsage(function (v) {
      socket.emit("cpu", (v * 100).toFixed(3));
    });

    disk
      .check(path)
      .then((info) =>
        socket.emit("disk", ((1 - info.free / info.total) * 100).toFixed(3))
      )
      .catch((err) => console.error(err));

    si.mem()
      .then((cb) => socket.emit("mem", (( 1 - (cb.available / cb.total)) * 100).toFixed(3)))
      .catch((error) => console.error(error));
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

app.get("/chart", (req, res) => {
  res.sendFile(__dirname + "/client/chart.html");
});

app.get('/canvas', (req, res) => {
  res.sendFile(__dirname + "/client/canvasjs.min.js")
})

app.get('/psl', (req, res) => {
  res.sendFile(__dirname + "/client/psl.min.js")
})
server.listen(port);
