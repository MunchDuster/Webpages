var ID = "";
const content = document.querySelector("#txt");
const reference = document.querySelector("#ref");
const speakbtn = document.querySelector("#speak");
const synth = window.speechSynthesis;
const socket = io();
var isTalking = false;
var curVerse = null;
var sentRequest = false;
synth.cancel();
socket.on("recieve first", function (verse) {
  content.innerText = verse.content;
  console.log(verse);
  reference.innerText = verse.reference;
  curVerse = verse;
});
socket.on("recieve", function (verse) {
  sentRequest = false;
  content.innerText = verse.content;
  console.log("verse recieved");
  reference.innerText = verse.reference;
  curVerse = verse;
  say(curVerse.content);
});
speakbtn.addEventListener("click", function () {
  isTalking = !isTalking;
  if (isTalking) {
    speakbtn.innerText = "STOP";
    var splits = curVerse.reference.split(":");
    var ref = "";
    for (var i = splits[0].length - 1; i > 0; i--) {
      if (!(splits[0].charCodeAt(i) >= 48 && splits[0].charCodeAt(i) <= 58)) {
        ref +=
          splits[0].substring(0, i) +
          " Chapter " +
          splits[0].substring(splits[0].length, i);
        break;
      }
    }
    for (var i = 0; i < splits[1].length; i++) {
      if (!(splits[1].charCodeAt(i) >= 48 && splits[1].charCodeAt(i) <= 58)) {
        ref += " Verse " + splits[1].substring(0, i);
        break;
      }
    }
    console.log(ref);
    say(ref + "\n " + curVerse.content);
  } else {
    speakbtn.innerText = "SPEAK";
    synth.cancel();
  }
});
async function say(words) {
  var toSpeak = new SpeechSynthesisUtterance(words);
  toSpeak.onend = function () {
    if (!sentRequest && isTalking) {
      console.log("requesting next verse");
      socket.emit("next");
      sentRequest = true;
    }
  };
  //console.log(toSpeak);
  synth.cancel();
  synth.speak(toSpeak);
}
function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
