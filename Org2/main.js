var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

class Event {
    constructor(name, creator, date, time, place, isPublic, code) {
        this.name = name;
        this.date = name;
        this.time = name;
        this.place = name;
        this.owner = creator.name;
        this.public = isPublic;
        this.users = [creator];
        this.code = generateCode();
       
    }
    isUser(userName) {
        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i].name = userName)
                return true;
        }
        return false;
    }
    removeUser(userName) {
        return this.users.splice(this.users.findIndex(user), 1);
    }
    joinUser(newuser) {
        this.users.forEach((user) => {
            user.Message('event', 'joined', { context: this.name, data: newuser.name });
        });
        this.users.push(newuser);
        return newuser;
    }
    deleteSelf() {
       
        //Notify all users
        this.users.forEach(function (user) {
            user.Message('event', 'deleted', this.code);
            user.events.splice(user.events.indexOf(this),1);
        });
        //Delete this event instance
        delete this;
    }
}
class Group {
    constructor(name, firstUser, isPublic) {
        this.name = name;
        this.users = [firstUser];
        this.code = generateCode();
        this.public = isPublic;
    }
    isUser(userName) {
        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i].name = userName)
                return true;
        }
        return false;
    }
    removeUser(userName) {
        const index = this.users.findIndex(user => user.name === userName);
        if (index != -1) {
            const user = this.users.splice(index, 1)[0];
            
        }
    }
    joinUser(user) {
        this.users.forEach((user) => {
            user.Message('group', 'joined', { context: this.name, data: newuser.name });
        });
        this.users.push(user);
        return user;
    }
}
class User {
    constructor(nm, socket, pswd) {
        this.name = nm;
        this.password = pswd;
        this.events = [];
        this.groups = [];
        this.pendingMessages = [];
        users.push(this);
        this.Connect(socket);
        return this;
    }
    Connect(socket) {
        this.isConnected = true;
        this.socket = socket;
    }
    Disconnect() {
        this.isConnected = false;
        this.socket = null;
    }
    deleteSelf() {
        //Remove from user list
        users.splice(users.indexOf(this), 1);
        //Notify events and groups
        this.events.forEach(event => {
            event.removeUser(user);
        });
        this.groups.forEach(group => {
            group.removeUser(user);
        });
        //Delete this user instance
        delete this;
    }
    addToGroup(group) {
        this.groups.push(group);
        group.AddUser(this);
    }
    Message(msgType, msgSubType, msg) {
        this.pendingMessages.push({ msgType: msgType, msgSubType: msgSubType, msg: msg });
    }
}

var users = [];
var usedCodes = [];
const codeLength = 8;
const digitsOfPrecision = 4;

function generateCode() {
    var code = "";
    for (var i = 0; i < codeLength; i++) {
        var ranNum = Math.floor(Math.random() * 35);
        if (ranNum > 9) {
            code += String.fromCharCode(ranNum + 55);
        } else {
            code += String.fromCharCode(ranNum + 48);
        }
    }
    if (usedCodes.find(element => element == code)) {
        code = generateCode();
    }
    usedCodes.push(code);
    return code;
}
function getGroup(name) {
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].name == name)
            return groups[i];
    }
}
function getUser(name) {
    return users.find(function (user) { user.name == name });
}

io.on('connection', function (socket) {
    console.log('user connected');

    var user;
    socket.on('validate user', function (name, pass) {

        user = getUser(name);
        console.log('user = ' + user);
        if (user != null) {
            if (user.password == pass) {
                isUser = true;
                user.active = true;
                socket.emit('validate user result', true, { groups: user.groups, events: user.events, msgs: user.pendingMessages });
                user.pendingMessages = [];
            } else {
                socket.emit('validate user result', false, { error: 'Incorrect user name or password.' });
            }
        } else {
            socket.emit('validate user result', false, { error: 'No user found.' });
        }
    });
    socket.on('create user', function (name, pass) {
        if (!getUser(name)) {
            user = new User(name, socket, pass);
            console.log('new user, ' + user.name);
            socket.emit('create user response', true);
            setInterval(function () {
                if (user) {
                    if (user.pendingMessages.length > 0) {
                        socket.emit('new msg', user.pendingMessages);
                        user.pendingMessages = [];
                    }
                }
            }, 1000);
        } else {
            socket.emit('create user response', false, 'User already exists');
        }

    });
    socket.on('create group', function (name) {
        console.log('creating group ' + name);
        user.groups.push(new Group(name));
    });
    socket.on('create event', function (name, date, time, place, isPublic, setcode) {
        console.log('creating event ' + name)
        user.events.push(new Event(name, user, date, time, place, isPublic, setcode));
        socket.emit('create event response',name, user.events[user.events.length - 1].code, true);
    });
    socket.on('join event', function (code) {
        console.log('searching for event ' + code);
        var hasFound = false;
        for (var u = 0; u < users.length; u++) {
            console.log('users[' + u + '] = ' + users[u]);
            var events = users[u].events;
           
            for (var i = 0; i < events.length; i++) {
                if (events[i].code == code) {
                    hasFound = true;
                    console.log('Test success,event: ' + events[i].toString());
                    socket.emit('join event response', true, { name: events[i].name, date: events[i].date, time: events[i].time, place: events[i].place, owner: events[i].owner, code: events[i].code });
                    events[i].joinUser(user);
                    break;
                }
            };
        }
        console.log('loop finished');
        if (!hasFound) {
            console.log('not found');
            socket.emit('join event response', false);

        }
    });
    socket.on('delete event', function (code) {
        var index = -1;
        for (var i = 0; i < user.events.length; i++) {
            if (user.events[i].code == code) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            user.events.splice(i, 1);
        }
    });
    socket.on('join group', function (name) {
        user.groups.push(getGroup(name));
    });
    socket.on('msg', function (data, groupName) {
        const members = getGroup(groupName).users;
        for (var i = 0; i < members.length; i++) {
            io.to(members[i].socket).emit('recieve msg', data);
        }
    });
    socket.on('disconnect', function (name) {
        console.log('user disconnected: ' + name);
    });
});

http.listen(3000, function () {
    console.log('Listening on port 3000.');
    const prefixes = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion','undecillion','duodecillion','tredecillion','quattuordecillion','quindecillion','sexdecillion','septendecillion','octodecillion','novemdecillion','vigintillion'];
    const possCodes = 36 ** codeLength;
    const prefixIndex = Math.floor(Math.log10(possCodes)) / 3;
    const num = Math.floor(possCodes * Math.pow(10, digitsOfPrecision) / (10 ** (3 * prefixIndex))) / Math.pow(10, digitsOfPrecision);
    console.log('There are ' + num.toString() + 'x10^'+ prefixIndex*3 + ' possible codes.');
});