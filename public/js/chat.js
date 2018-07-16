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
    socket.emit('chat', {
        msg: $msg,
        room: $currentroom
    });
    
    $send.val('');
}

// Send photos
function sendFile(inp) {
    if (inp.files && inp.files[0]) {
        var FR = new FileReader();
        FR.fileName = inp.files[0].name
        FR.onload = function (e) {
            socket.emit('chat image', {
                img: e.target.result,
                room: $currentroom
            });
            var data = {
                message: 'The file was sent to everybody',
                timeout: 2500
            };
            $snackbar.MaterialSnackbar.showSnackbar(data);
            
        };
        FR.readAsDataURL(inp.files[0]);
    }
}

//Server sends a new message
socket.on('chat', function (msg) {
    var color = (username != msg.user) ? "mdl-color--light-blue" : "mdl-color--teal"
    //Create new message
    var $main = $('<div></div>').addClass("message clearfix");
    var $message = $("<div></div>").html(msg.msg);
    var $chip = $("<span></span>").addClass("mdl-chip mdl-chip--contact");
    var $icon = $("<span></span>").text(msg.user.charAt(0)).addClass("mdl-chip__contact mdl-color-text--white " + color);
    var $nickname = $("<span></span>").text(msg.user).addClass("mdl-chip__text message-nick");
    var $date = $("<time></time>")
        .attr( "datetime" , new Date().toISOString() )
        .addClass("timeago");
    
    //Build the message html and append it to the correct room div
    $nickname.append($date);
    $chip.append($icon);
    $chip.append($nickname);
    $main.append($message);
    $main.append($chip);

    $('#messages-' + msg.room).append($main);
    
    $main.find("time.timeago").timeago();
    
    // Scroll down
    $('#messages-' + msg.room).animate({
        scrollTop: $('#messages-' + msg.room).prop("scrollHeight")
    }, 1500);
    
    // Notificate based on user preferences
    if(username != msg.user){
        notificate("New message from " + msg.user + " on " + msg.room, msg.msg);
    }
});

//Server sends a new photo
socket.on('chat image', function (msg) {
    var color = (username != msg.user) ? "mdl-color--light-blue" : "mdl-color--teal"
    //Create new message
    var $main = $('<div></div>').addClass("message clearfix");
    var $message = $("<div></div>").append($('<img>',{
        src: msg.img,
        class:'message-image'
    }));
    var $chip = $("<span></span>").addClass("mdl-chip mdl-chip--contact");
    var $icon = $("<span></span>").text(msg.user.charAt(0)).addClass("mdl-chip__contact mdl-color-text--white " + color);
    var $nickname = $("<span></span>").text(msg.user).addClass("mdl-chip__text message-nick");
    var $date = $("<time></time>")
        .attr( "datetime" , new Date().toISOString() )
        .addClass("timeago");
    
    //Build the message html and append it to the correct room div
    $nickname.append($date);
    $chip.append($icon);
    $chip.append($nickname);
    $main.append($message);
    $main.append($chip);
    
    $('#messages-' + msg.room).append($main);
    
    $main.find("time.timeago").timeago();
    
    // Scroll down
    $('#messages-' + msg.room).animate({
        scrollTop: $('#messages-' + msg.room).prop("scrollHeight")
    }, 1500);
    
    // Notificate based on user preferences
    if(username != msg.user){
        notificate("New message from " + msg.user + " on " + msg.room, msg.msg);
    }
});