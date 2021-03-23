const password = 'jeff';

const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { joinUser, removeUser } = require("./users");

app.use(express.static(__dirname + "/Client"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
var msgType = {
  USER: 0,
  SYSTEM: 1,
};
var msgs = [];
function addMsg(msg, msgType, dateTime, user) {
  var obj = {
    msg: msg,
    msgType: msgType,
    dateTime: dateTime,
    user: user,
  };
  msgs.push(obj);

  if (msgs.length > 100) {
    for (var i = 1; i < 100; i++) {
      msgs[i - 1] = msg[i];
    }
    for (var i = 100; i < msgs.length; i++) {
      msgs[i] = null;
    }
  }
  return obj;
}
function getDateTime(date_ob) {
  var dert = new Date();
  return {
    minute: dert.getMinutes(),
    hour: dert.getHours(),
    day: dert.getDate(),
    month: dert.getMonth(),
    year: dert.getFullYear(),
  };
}
io.on("connection", function (socket) {
	console.log("connected");
	var username = '';
	socket.emit('room pass', password);
	socket.on("entered room", function (userName, dateTime) {
		username = userName;
		const joinedMessage = addMsg(
			userName + " connected",
			msgType.SYSTEM,
			dateTime
		);
		console.log(joinedMessage);
		socket.emit("ketchup", msgs);
		socket.broadcast.emit("receive chat", joinedMessage);
	});
	socket.on("chat msg", function (msg, dateTime, user) {
		var msg = addMsg(msg, msgType.USER, dateTime, user);
    	socket.broadcast.emit("receive chat", msg);
  });
	socket.on("disconnect", function () {
    if (username != "") {
      const leftMessage = addMsg(
        username + " disconnected",
        msgType.SYSTEM,
        getDateTime()
      );
      socket.broadcast.emit("receive chat", leftMessage);
    }
  });
});

http.listen(8080, () => {
  console.log("listening on 8080");
});
