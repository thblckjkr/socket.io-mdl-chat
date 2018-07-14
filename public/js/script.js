var $currentroom = "main";
var $send = "";

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

function sendFile(inp) {
    if (inp.files && inp.files[0]) {
        var FR = new FileReader();
        FR.fileName = inp.files[0].name
        FR.onload = function (e) {
            socket.emit('chat image', e.target.result);
            $('.upload-form').append('<div class="success">The file ' + e.target.fileName + ' was sent to everybody</div>');
            console.log(e.target);
            setTimeout(function () {
                toggle('#upload-form');
                $('.success').remove();
            }, 1500);
        };
        FR.readAsDataURL(inp.files[0]);
    }
}

$('#send-image').on("click", function () {
    sendFile(document.getElementById('input-image'));
});

/*document.getElementById("input-image-text").onchange = function () {
    document.getElementById("input-image").value = this.files[0].name;
};

$('form').submit(function () {
    if ($('#m').val() != '') {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
    }
    return false;
});
*/