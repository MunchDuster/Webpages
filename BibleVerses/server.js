var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const { joinUser, removeUser } = require("./users");

const BibleScraper = require("bible-scraper");
const niv = new BibleScraper(111);

const newTestament = [
  "MAT",
  "MAR",
  "LUK",
  "JON",
  "ACT",
  "ROM",
  "1CO",
  "2CO",
  "GAL",
  "EPH",
  "PHP",
  "COL",
  "1TH",
  "2TH",
  "1TI",
  "2TI",
  "TIT",
  "PHI",
  "HEB",
  "JAM",
  "1PE",
  "2PE",
  "1JO",
  "2JO",
  "3JO",
  "JUD",
  "REV",
];
const oldTestament = [
  "GEN",
  "EXO",
  "LEV",
  "NUM",
  "DEU",
  "JOS",
  "JUG",
  "RUT",
  "1SA",
  "2SA",
  "1KI",
  "2KI",
  "1CH",
  "2CH",
  "EZR",
  "NEH",
  "EST",
  "JOB",
  "PSA",
  "PRO",
  "ECC",
  "SOL",
  "ISA",
  "JER",
  "LAM",
  "EZE",
  "DAN",
  "HOS",
  "JOE",
  "AMO",
  "OBA",
  "JON",
  "MIC",
  "NHM",
  "HAB",
  "ZEP",
  "HAG",
  "ZEC",
  "MAL",
];

function getBook(book) {
  if (book > oldTestament.length) {
    return newTestament[book - 1 - 39];
  } else {
    return oldTestament[book - 1];
  }
}
function getPoint(user) {
  return getBook(user.book) + "." + user.chapter + "." + user.verse;
}
app.use(express.static(__dirname + "/Client"));
app.get("/", async function (req, res) {
  res.sendFile(__dirname + "/index.html");

  io.on("connection", async (socket) => {
    var user = joinUser(socket.id);
    var curverse = await niv.verse(getPoint(user));
    socket.emit("recieve first", curverse);

    socket.on("next", async () => {
      user.verse += 1;
      curverse = await niv.verse(getPoint(user));
      if (curverse.content == "") {
        user.verse = 1;
        user.chapter += 1;
        curverse = await niv.verse(getPoint(user));
      }
      if (curverse.content == "") {
        user.chapter = 1;
        user.book += 1;
        curverse = await niv.verse(getPoint(user));
      }
      socket.emit("recieve", curverse);
    });
    socket.on("disconnect", () => {
      removeUser(user);
    });
  });
});
http.listen(8080, function () {
  console.log("Server on port 8080");
});
