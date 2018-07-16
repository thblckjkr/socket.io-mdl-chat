// Markdown parser for parse messages
var markdown = require("node-markdown").Markdown; //For markdown messages

// Load config 
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

/** Some global variables for the system **/
var users = {}; //Users array for chat
var rooms = {}; // Rooms array for chat

// Main engine update for sockets
var Engine = function (io) {
    io.on("connection", function (socket) {
        
        socket.on('login', function (data, callback) {
            if (data in users) {
                callback(false);
            } else {
                callback(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                socket.join('main');
                if (rooms['main'] == undefined) rooms['main'] = [];
                rooms['main'].push(socket.nickname);
                io.emit('user');
            }
        });

        socket.on('chat', function (msg) {
            io.to(msg.room).emit('chat', {
                msg: markdown(
                    msg.msg,
                    true, 
                    config.markdown.allowedTags,
                    config.markdown.allowedAttributes
                ),
                user: socket.nickname,
                room: msg.room
            });
        });

        socket.on('chat image', function (msg) {
            io.to(msg.room).emit('chat image', {
                img: msg.img,
                user: socket.nickname,
                room: msg.room
            });
        });

        socket.on('join', function (room) {
            socket.join(room);
            io.emit('user');
            if (rooms[room] == undefined) rooms[room] = [];
            rooms[room].push(socket.nickname);
        });

        socket.on('getusers', function (data) {
            socket.emit('users', rooms[data]);
        });

        socket.on('disconnect', function (data) {
            delete users[socket.nickname];
            for (var room in rooms) {
                if (rooms.hasOwnProperty(room)) {
                    var element = rooms[room];
                    var index = element.indexOf(socket.nickname);
                    if (index > -1) {
                        element.splice(index, 1);
                        io.to(room).emit('user');
                    }
                }
            }  
        });
    });
}


module.exports = Engine;