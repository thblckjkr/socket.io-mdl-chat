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
            // If you want some kind of login
            // Just implement here and made a callback with true if can login and false if can't
            if (data in users) {
                callback(false);
            } else {
                callback(true);
                socket.nickname = data;
                users[socket.nickname] = socket;

                socket.join('main');
                if (rooms['main'] == undefined) rooms['main'] = [];
                rooms['main'].push(socket.nickname);

                io.to('main').emit('new user', socket.nickname );
                io.to('main').emit('update users', rooms['main']);
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

        // On private messages,emit it to the sender and to the final user
        socket.on("private", function(data) {
            io.to(users[data.to].id).emit("private", {
                from: socket.nickname,
                to: data.to,
                msg: data.msg
            });
            io.to(socket.id).emit("private", {
                from: socket.nickname,
                to: data.to,
                msg: data.msg
            });
        });

        socket.on('private image', function (data) {
            io.to(users[data.to].id).emit('chat image', {
                img: data.img,
                user: socket.nickname,
                room: data.room
            });
            io.to(socket.id).emit('chat image', {
                img: data.img,
                user: socket.nickname,
                room: data.room
            });
        });

        socket.on('disconnect', function (data) {
            delete users[socket.nickname];
            for (var room in rooms) {
                if (rooms.hasOwnProperty(room)) {
                    var element = rooms[room];
                    var index = element.indexOf(socket.nickname);
                    if (index > -1) {
                        element.splice(index, 1);
                        io.to(room).emit('user disconnected', socket.nickname);
                        io.to(room).emit('update users', rooms['main']);
                    }
                }
            }
        });
    });
}


module.exports = Engine;