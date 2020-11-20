const { on } = require("process");
var os = require('os-utils');
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("Got connect!");

  setInterval(() => {
    os.cpuUsage(function(v){
      console.log( 'CPU Usage (%): ' + (v * 100).toFixed(1) );
      socket.emit("cpu", (v * 100).toFixed(1));
    });
    
  }, 300);

  socket.on("msg", function (data) {
    console.log(data);
    socket.emit("cpu", "hello friends!");
  });

  socket.on("disconnect", function () {
    console.log("Got disconnect!");
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

server.listen(1234);
