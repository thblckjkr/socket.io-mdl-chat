var $currentroom = "main";
var $currentchat ;
var $send = "";
var $snackbar = document.querySelector('#notification');

$(document).ready(function () {
    $send = $("#send-text");

    // Fade loading page on load
    $('#login').fadeIn('fast', function(){
        $('#loading').fadeOut('fast');
    });

    // Login actions
    $("#login-username").on("keypress", function(e){
        if(e.which ==  13){
            login();
        }
    });
    $("#login-btn").on("click", function(){
        login();
    });

    // Send messages and photos triggers
    $send.on("keypress", function(e){
        if(e.which == 13 && !e.shiftKey){
            e.preventDefault();
            sendMessage();
        }
    })

    // Send photos
    $("#send-photo").on("click", function(){
        $("#send-photo-file").trigger("click");
    });
    $("#send-photo-file").on("change", function(e){
        sendFile( $(this)[0] );
    })
    $('body').on("click", '.message-image', function(){
        window.open( $(this).attr("src") )
    }); 

    // Change current room on click
    $("#bar-chat").on("click", ".mdl-tabs__tab", function(){
        glb = $(this)
        var data = $(this).attr("href").split("-");
        if(data.length == 2){
            $currentroom = data.pop();
        }else{
            $currentchat = data.pop()
            $currentroom = data.pop()
        }
    })

    // Initiate a new private chat
    $('body').on("click", '.message-nick', function(){
        var $user = $(this).attr("data");

        if($user == username)
            return true;

        $room  = "private-" + $user;
        addRoomDiv( $room, "[" + $user + "]")
    });
});

function addMessage($message, $room, $user) {
    var color = (username != $user) ? "mdl-color--light-blue" : "mdl-color--teal"
    //Create new message
    var $main = $('<div></div>').addClass("message clearfix");
    var $chip = $("<span></span>").addClass("mdl-chip mdl-chip--contact");
    var $icon = $("<span></span>").text($user.charAt(0)).addClass("mdl-chip__contact mdl-color-text--white " + color);
    var $nickname = $("<span></span>").attr("data", $user).text($user).addClass("mdl-chip__text message-nick");
    var $date = $("<time></time>")
        .attr( "datetime" , new Date().toISOString() )
        .addClass("timeago");
    
    //Build the message html and append it to the correct room div
    $nickname.append($date);
    $chip.append($icon);
    $chip.append($nickname);
    $main.append($message);
    $main.append($chip);

    $('#messages-' + $room).append($main);
    
    $main.find("time.timeago").timeago();
    
    // Scroll down
    $('#messages-' + $room).animate({
        scrollTop: $('#messages-' + $room).prop("scrollHeight")
    }, 1500);
    
    // Notificate based on user preferences
    if(username != $user){
        notificate("New message from " + $user + " on " + $room, $message.text());
    }
}

function addRoomDiv($id, $text) {
    // div already exist!
    if ( $('#messages-' + $id).length ) {
        return ;
    }

    var tabbar = document.querySelector('.mdl-tabs__tab-bar');

    $div = $('<div></div>', {
        id: "messages-" + $id,
        class: "mdl-tabs__panel messages-container chat-window"
    });
 
    var a = document.createElement('a');
    a.href = "#messages-" + $id;
    a.classList.add('mdl-tabs__tab');
    a.textContent = $text;
    tabbar.appendChild(a);
    
    $("#send-container").before($div);

    document.querySelector(".mdl-tabs").MaterialTabs.initTabs_();
    // new MaterialTabs(a, tabs.MaterialTabs);
}

function notificate(title, message) {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    
    if ($('#options-showAlerts').is(':checked')) {
        var extra = {
            body: getPlainText(message)
        };
        var noti = new Notification(title, extra);
        noti.onclick = function () {
            noti.close();
        };
        setTimeout(function () {
            noti.close();
        }, 5000);
    }
    
    playAudio();
}

function playAudio() {
    if ($('#options-playSound').is(':checked')) {
        $('#audio')[0].play();
    }
}

function getPlainText(html) {
    return $('<p>' + html + '</p>').text();
}