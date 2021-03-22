var socket = io();
socket.emit("page type", "chat");

var currentdate = new Date();
setTimeout(updateTime, 1000);

var userName;
var room;
var ID;
var pass;
var roomPass;

var container = document.getElementById("messages");
var textBox = document.getElementById("m");
var curHolder = document.getElementById("stuff");

function getDateTime() {
  return (
    currentdate.getDate() +
    "/" +
    (parseInt(currentdate.getMonth()) + 1) +
    "/" +
    currentdate.getFullYear() +
    " , " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds()
  );
}
function updateTime() {
  currentdate.setSeconds(currentdate.getSeconds() + 1);
  setTimeout(updateTime, 1000);
}
function sendMsg() {
  console.log("sending chat msg...");

  socket.emit("chat msg", {
    msg: textBox.value,
    user: userName,
    room: room,
    dateTime: getDateTime(),
  });

  makeMessage(userName, textBox.value, getDateTime());
}
function addOnTop(div) {
  //Move all messages down
  var moveAmt = div.clientWidth;
  for (var i = 0; i < container.childNodes.length; i++) {
    container.childNodes[i].style.top += moveAmt;
    moveAmt = container.childNodes[i].style.top;
  }
  //Add new message
  div.style.top = 0;
  container.insertBefore(div, container.childNodes[0]);
}
function makeMessage(user, msg, dateTime) {
  var newDiv = document.createElement("div");
  var addOn = "";
  if (user == userName) {
    addOn = "(You)";
    newDiv.className = "my-msgBox";
  } else newDiv.className = "other-msgBox";
  newDiv.innerHTML = user + addOn + ": " + msg + "<sub>" + dateTime + "</sub>";

  addOnTop(newDiv);
}
function makeSystemMessage(msg, dateTime) {
  var newDiv = document.createElement("div");
  newDiv.className = "system-msgBox";
  newDiv.innerHTML = msg + "<sub>" + dateTime + "</sub>";

  addOnTop(newDiv);
}

socket.emit("check room", room, ID);

socket.on("check room result", function (isRoom, dpass) {
  if (isRoom) {
    pass = prompt("Room found, please enter password.");
    while (pass != dpass) {
      alert("Incorrect password,please try again");
      pass = prompt("Room found, please enter password.");
    }

    curHolder.innerText =
      "Name: " + userName + " ,Room: " + room + " ,Password: " + pass;
    socket.emit("join room", { username: userName, roomname: room });
  } else {
    var wantsToMake = confirm("Join room not found. Do you wish to make one?");
    if (wantsToMake) {
      socket.emit("create room", room, prompt("What will be the password?"));
      socket.emit("join room", { username: userName, roomname: room });
      socket.emit("join room", { username: userName, roomname: room });
    } else {
      room = prompt("room name");
      socket.emit("check room", room, ID);
    }
  }
});
socket.on("chat page data", function (id, username, roomName, msgs, roompass) {
  ID = id;
  userName = username;
  roomPass = roompass;
  room = roomName;

  for (let i = 0; i < msgs.length; i++) {
    if (!msgs[i].isSystemMessage)
      setTimeout(makeMessage(msgs[i].user, msgs[i].msg, msgs[i].dateTime), 20);
    else setTimeout(makeSystemMessage(msgs[i].msg, msgs[i].dateTime), 20);
  }
  makeSystemMessage(userName + " connected.", getDateTime());
});
socket.on("receive chat", function (data) {
  if (data.room == room) {
    console.log("Incoming message");
    makeMessage(data.user, data.msg, data.dateTime);
  }
});
socket.on("systemMsg", function (data) {
  if (data.room == room) {
    console.log("Incoming system message");
    makeSystemMessage(data.msg, data.dateTime);
  }
});