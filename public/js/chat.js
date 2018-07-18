var socket = io();
var username = "";

// Login a username
function login() {
    usr = $("#login-username").val();
    if (usr == "") {
        alert("Please specify a username")
        return;
    }
    
    socket.emit('login', usr, function (data) {
        if (data) {
            $("#login").fadeOut("slow");
            username = usr;
        } else {
            alert("Username already taken");
        }
    });
    
    $("#login-username").val('');
}

// Send message
function sendMessage() {
    var $msg = $send.val();
    if($msg == ""){
        return;
    }
    $msg = $msg.replace(/(?:\r\n|\r|\n)/g, '<br>');

    if($currentroom == "private"){
        socket.emit('private', {
            msg: $msg,
            to: $currentchat
        });
    }else{
        socket.emit('chat', {
            msg: $msg,
            room: $currentroom
        });
    }
    
    $send.val('');
}

// Send photos
function sendFile(inp) {
    if (inp.files && inp.files[0]) {
        var FR = new FileReader();
        FR.fileName = inp.files[0].name
        FR.onload = function (e) {
            // Send the image
            if($currentroom == "private"){
                socket.emit('private image', {
                    img: e.target.result,
                    to: $currentchat
                });
            }else{
                socket.emit('chat image', {
                    img: e.target.result,
                    room: $currentroom
                });
            }

            // Create a cute snackbar notification
            var data = {
                message: 'The file was sent to everybody',
                timeout: 2500
            };
            $snackbar.MaterialSnackbar.showSnackbar(data);
            
        };
        FR.readAsDataURL(inp.files[0]);
    }
}

// Server sends a new message
socket.on('chat', function (msg) {
    var $message = $("<div></div>").html(msg.msg);
    addMessage($message, msg.room, msg.user)
});

// Server sends a new photo
socket.on('chat image', function (msg) {
    var $message = $("<div></div>").append($('<img>',{
        src: msg.img,
        class:'message-image'
    }));
    addMessage($message, msg.room, msg.user)
});

// Server send a new private message
socket.on('private', function(msg) {
console.log(msg)
    // Workaround my own message
    var addTo = (msg.from == username) ? msg.to : msg.from;

    var $private_room = 'private-' + addTo;
    
    addRoomDiv($private_room, "[" + msg.from + "]");

    var $message = $("<div></div>").html(msg.msg);
    addMessage($message, $private_room, msg.from)
});

// Server sends a new private photo 
socket.on('private image', function(msg){
    var $message = $("<div></div>").append($('<img>',{
        src: msg.img,
        class:'message-image'
    }));
    addMessage($message, msg.room, msg.user)
});

// Servers disconnect
socket.on('disconnect', function(usr){
    if(usr == "transport error" || usr == "io server disconnect" || usr == "transport close"){
        var data = {
            message: 'You have been disconnected due a network failure',
            timeout: 6500
        };
        $snackbar.MaterialSnackbar.showSnackbar(data);
        location.reload();
    }
});

// A user disconnects
socket.on('user disconnected', function($user){
    // Create a cute snackbar notification
    var data = {
        message: $user + ' says goodbye',
        timeout: 2500
    };
    $snackbar.MaterialSnackbar.showSnackbar(data);

    // And notificate throwgh a normal notificate
    if(username != $user){
        notificate( $user + " disconnected" , $user + " says bye!");
    }
});

// A new user logged to the server
socket.on('new user', function($user){
    // Create a cute snackbar notification
    var data = {
        message: $user + ' says hello',
        timeout: 2500
    };
    $snackbar.MaterialSnackbar.showSnackbar(data);

    // And notificate throwgh a normal notificate
    if(username != $user){
        notificate( $user + " connected" , $user + " says hello!");
    }
})

// The server is sending a users list
socket.on('update users', function(data){
    $('#options-users').empty();
    if( typeof(data) !== "undefined" && data !== null ){
        data.forEach( function(user){ 
            var temp = $('<li></li>', {
                class: "mdl-navigation__link message-nick",
            })
            .text(user)
            .attr("data", user);

            $('#options-users').append(temp);
        });
    }
})