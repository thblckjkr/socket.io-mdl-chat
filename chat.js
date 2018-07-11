/* Initial socket.io requires */
var app = require('express')();
var http = require('http').Server(app); var req = require('http');
var io = require('socket.io')(http);

var fs = require('fs'); //For logging
var md = require("node-markdown").Markdown; //For markdown messages

/** Some global variables for the system **/
var users = {}; //Users array for chat
var rooms = ['Main', 'Developers', 'Support']; //Rooms array for chat [prevents from create unauthorized rooms]
var port = 80; //Port to be used by chat

/** limit HTML tags and keep attributes for allowed tags (Markdown!!) **/
var allowedTags = 'p|strong|span|a|strong|em';
var allowedAttributes = { 'a':'href', 'span':'style' }


function getDateString(){ return (new Date().toDateString() + " " + new Date().toTimeString()).slice(0, -15); }

function deleteUser(val) {
    for(var f in users) { if(users.hasOwnProperty(f) && users[f] == val) { delete users[f]; return f; } }
}

app.get('*', function(req, res){ 
  var name = "";
  switch(req.originalUrl){
    case "/":
      name = "index.html"; break;
    default:
      name = req.originalUrl;
  }
  res.sendFile(__dirname + '/public/' + name);
});

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

io.on('connection', function(socket){

  io.emit('update users', users);

  socket.on('get users', function(){
    io.emit('update users', users);
    io.sockets.in(socket.room).emit('update roomies', getClients(socket.room));
  });

  socket.on('chat message', function(msg){
    if(users[socket.id] !== undefined){
      var temp = md(msg, true, allowedTags, allowedAttributes);  
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
    var options = {
      host: '127.0.0.1',
      port: 80,
      path: '/chat/query.php?action=validate&username=' + o.username + '&password=' + o.password
    };
    req.get(options, function(res){
      var body = '';
      res.on('data', function(d){
          body += d;
      });
      res.on('end', function(){
        var response = JSON.parse(body);
        if(response.loged == true){
          var id = deleteUser(response.name);
          if (io.sockets.connected[id]) { io.sockets.connected[id].disconnect(); }
          io.emit('update users', users);
          io.to(socket.id).emit("retry-login", "Sucessfully unloged");
        }
      });
    });
  });

});

http.listen(port , function(){
  console.log('[chat] listening on *: ' + port);
});


/** fs.appendFile("conversation.log", users[socket.id]  + ": " + msg + " \t\t " + getDateString() + "\n" ); **/