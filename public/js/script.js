var $currentroom = "main";
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
    $("tabs-chat", ".chat-window").on("click", function(){
        $currentroom = $(this).attr("id").split("-").pop();
    })
});

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