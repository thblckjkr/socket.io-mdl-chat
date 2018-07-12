// Markdown parser for parse messages
    var md = require("node-markdown").Markdown; //For markdown messages

// Load config 
    var fs = require('fs');
    var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

/** Some global variables for the system **/
    var users = {}; //Users array for chat
    var rooms = config.rooms; // Rooms array for chat

// Main engine update for sockets
var Engine = function ( io ) {
    io.on( "connection", function(socket) {
        io.emit('update users', users);
        
        socket.on('get users', function(){
            io.emit('update users', users);
            io.sockets.in(socket.room).emit('update roomies', getClients(socket.room));
        });
        
        socket.on('get rooms', function(){
            io.emit('update rooms', users);
            io.sockets.in(socket.room).emit('update rooms', rooms);
        });
        
        socket.on('chat message', function(msg){
            if(users[socket.id] !== undefined){
                var temp = md(
                    msg,
                    true, 
                    config.markdown.allowedTags, 
                    config.markdown.allowedAttributes
                );  
                io.sockets.in(socket.room).emit('chat message', temp, users[socket.id] );
            }
        });
        
        socket.on('chat image', function(img){
            if(users[socket.id] !== undefined){
                io.sockets.in(socket.room).emit('chat image', img, users[socket.id] );
            }
        });
        
        socket.on('new user', function(usr, area){
            socket.username = usr
            socket.room = 'Main';
            users[socket.id] = usr;
            socket.join('Main');
            io.sockets.in(socket.room).emit('new user', usr, area);
            io.emit('update users', users);
            io.sockets.in(socket.room).emit('update roomies', getClients(socket.room));
        });
        
        socket.on('disconnect', function(){
            if(users[socket.id] != null){
                io.sockets.in(socket.room).emit('disconnect' , users[socket.id]);
                delete users[socket.id];
                io.emit('update users', users);
                socket.leave(socket.room);
            }
        });
        
        socket.on('change-room', function(newRoom){
            if(rooms.indexOf(newRoom) > -1){
                io.sockets.in(socket.room).emit('disconnect' , users[socket.id]); socket.leave(socket.room);
                socket.join(newRoom); socket.room = newRoom;
                io.sockets.in(socket.room).emit( 'room change', users[socket.id], newRoom );  
                io.sockets.in(socket.room).emit('update roomies', getClients(socket.room));
            }
        });
        
        socket.on('force-disconnect', function(data){
            var o = JSON.parse(data);
            
            if(response.loged == true){
                var id = deleteUser(o.data);
                if (io.sockets.connected[id]) { io.sockets.connected[id].disconnect(); }
                io.emit('update users', users);
                io.to(socket.id).emit("retry-login", "Sucessfully unloged");
            }
        });
    });
    
    function deleteUser(val) {
        for(var f in users) {
            if(users.hasOwnProperty(f) && users[f] == val) {
                delete users[f]; return f;
            }
        }
    }
    
    function getClients( roomId ) {
        if(roomId !== undefined){
            var clients = new Array();
            for ( var client in io.sockets.adapter.rooms[roomId].sockets ){
                clients.push( users[client] );
            }
            return clients;
        }
        return null;
    }
}


module.exports = Engine;