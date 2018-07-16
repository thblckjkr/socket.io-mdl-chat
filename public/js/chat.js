var socket = io();
var username = "";

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

//Send message
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

//Server sends a new message
socket.on('chat', function (msg) {
    //Calculate time
    var d = new Date();
    //Create new message
    var $main = $('<div></div>').addClass("message clearfix");
    var $message = $("<div></div>").html(msg.msg);
    var $chip = $("<span></span>").addClass("mdl-chip mdl-chip--contact");
    var $icon = $("<span></span>").text(msg.user.charAt(0)).addClass("mdl-chip__contact mdl-color--teal mdl-color-text--white");
    var $nickname = $("<span></span>").text(msg.user).addClass("mdl-chip__text message-nick");
    var $date = $("<small></small>").text(d.toDateString());

    //Build the message html and append it to the correct room div
    $nickname.append($date);
    $chip.append($icon);
    $chip.append($nickname);
    $main.append($message);
    $main.append($chip);

    $('#messages-' + msg.room).append($main);

    // Scroll down
    $('#messages-' + msg.room).animate({
        scrollTop: $('#messages-' + msg.room).prop("scrollHeight")
    }, 1500);
    // Notificate based on user preferences
    notificate("New message from " + msg.user + " on " + msg.room, msg.msg);
});