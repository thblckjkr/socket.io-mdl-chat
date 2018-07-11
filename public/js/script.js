function toggle(div){ $(div).animate({width: 'toggle'}) }

    $('#upload-btn').on("click", function(){
        //$('#upload-form').fadeIn('slow');
        toggle('#upload-form');
    });

    $('.close-form').on("click", function(){
        //$('#' + $(this).attr("for")).fadeOut('slow');
        toggle('#' + $(this).attr("for"))
    });

    $('#messages').on("click", '.chat-image', function(){ 
    	window.open( $(this).attr("src") ) 
    });

    function sendFile(inp) {
        if (inp.files && inp.files[0]) {
            var FR= new FileReader();
            FR.fileName = inp.files[0].name
            FR.onload = function(e) {
                socket.emit('chat image', e.target.result);
                $('.upload-form').append('<div class="success">The file ' + e.target.fileName + ' was sent to everybody</div>');
                console.log(e.target);
                setTimeout( function(){
                    toggle('#upload-form');
                    $('.success').remove();
                }, 1500);
            };       
            FR.readAsDataURL( inp.files[0] );
        }
    }

    $('#send-image').on("click", function(){
        sendFile(document.getElementById('input-image'));
    });

    function getPlainText(html) {
        return $('<p>' + html + '</p>').text();
    }

    var socket = io();
    var ret, gUser;

    $('form').submit(function(){
    	if($('#m').val() != ''){
    		socket.emit('chat message', $('#m').val());
	        $('#m').val('');
    	}
    	return false;
    });

    socket.on('chat message', function(msg, usr){
        console.log('Mensaje', msg);
        var c = (usr == gUser) ? "message yourself" : "message";
        var data = (usr == gUser) ? "" : '<p class="username">' + usr + '</p>';
    	var newMessage = '<div class="clearfix">' + data + '<li class="' + c + '">';
    	newMessage += msg;
    	newMessage += '</li></div>';
        $('#messages').append( newMessage ); scrollDown();
        if(usr != gUser){
            showSmartAlert(usr, getPlainText(msg)); playAudio();
        }
        $('.message > p').emoticonize();
        $('.message > p > a').attr("target", "_blank");
    });

    socket.on('chat image', function(img, usr){
        var c = (usr == gUser) ? "message yourself" : "message";
        var data = (usr == gUser) ? "" : '<p class="username">' + usr + '</p>';
        var newMessage = '<div class="clearfix">' + data + '<li class="' + c + '">';
        newMessage += '<img class="chat-image" src="' + img + '" alt="image_on_chat">';
        newMessage += '</li></div>';
        $('#messages').append( newMessage ); scrollDown();
        if(usr != gUser){
            showSmartAlert(usr, 'Image sent'); playAudio();
        }
    });

    socket.on('new user', function(usr, area){
        $('#messages').append("<div class='clearfix'><li class='newUser message'>A new user has logged to the chat!<br>Hi! <b>" + usr + "</b> from " + area + "</li></div>"); scrollDown();
        showSmartAlert('New User', 'Say hello to ' + usr);
    });

    socket.on('disconnect', function(usr){
        if(usr == "transport error" || usr == "io server disconnect" || usr == "transport close"){
            $('#messages').append("<div class='clearfix'><li class='disconnect message'>You has disconnected for Network failure. Please reload the page</li></div>");
            location.reload();
        }else{
            $('#messages').append("<div class='clearfix'><li class='disconnect message'>The user <b>" + usr + "</b> has leaved the room</li></div>"); scrollDown();
            showSmartAlert('User gone', usr + ' has left the chat');
        }
        socket.emit("get users");
    });

    socket.on('room change', function(usr, room){
    	if(usr != gUser){
    		$('#messages').append("<div class='clearfix'><li class='disconnect message' style='color:green'>The user <b>" + usr + "</b> has enter to room</li></div>");
    		scrollDown();
    	}else{
    		$('#messages').append("<div class='clearfix'><li class='disconnect message' style='color:green'>Hello! Now you are on " + room + "</li></div>");
    		$('#room').text( room + " chat room");
    		scrollDown();
    	}
    });
    socket.on('update users', function(list){
        console.log("Actualizacion de usuarios", list);
        usuarios = list;
    });

    socket.on('update roomies', function(roomies) {
        if( typeof(roomies) !== "undefined" && roomies !== null ){
            console.log("Actualizacion de roomies", roomies);
            var lis ="";  roomies.forEach( function(u){ 
                lis += "<li class='mdl-navigation__link'>" + u + "</li>"; 
            }); $('#users').html(lis);
        }
    })

    socket.on('retry-login', function(){
    	setTimeout(login($('#clock').val(), $('#password').val()), 200)
    });


    $(document).ready(function(){
        $('#joinRoom').on('click', function(){
            toggle('#selectRoom');
        });

        $('.joinRoom').on("click", function(){
            socket.emit("change-room", $(this).attr("for"));
            toggle('#selectRoom');
            setTimeout(function(){
                $('#drawer').removeClass("is-visible");
            }, 500);
        });

    	$('#login').on("click", function(){
    		if( $('#clock').val() == "" ) { alert("Please fill the data"); }else{ login($('#clock').val(), $('#password').val()); }
    		// if( $('#clock').val() == "" || $('#password').val() == ""){ alert("Please fill the data"); }else{ login($('#clock').val(), $('#password').val()); }
    	});

        $('#password').bind('keypress', function(e) {
            if ((e.keyCode || e.which) == 13){
                // if( $('#clock').val() == "" || $('#password').val() == ""){ alert("Please fill the data"); }else{ login($('#clock').val(), $('#password').val()); }
                if( $('#clock').val() == "" ){ alert("Please fill the data"); }else{ login($('#clock').val(), $('#password').val()); }
            }
        });

    	initialize();
    	console.log("Hello seahorse!");

    	//Chat Audio!!!
		$('<audio id="audio"><source src="/audio/sound.ogg" type="audio/ogg"></audio>').appendTo("body");
    });

function scrollDown(){ d = (navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) ? '#container' : '.mdl-layout__content'; $(d).animate({ scrollTop: $('#container').prop("scrollHeight") }, 700, "swing" );}
function initialize(){
	if(typeof usuarios === 'undefined'){
		socket.emit("get users");
		setTimeout(initialize, 200);
	}else{
		$('#loading').fadeOut('fast');
	}
}

function login(username, password){
    var response = {
        loged : true,
        name : username,
        area : "FREE"
    };
    
    $('.login-failed').remove();

    var alreadyloged;
    if(response.loged == true && response.name != null ){
        for (key in usuarios) { if(response.name == usuarios[key]){ alreadyloged = true; } }
        if(!alreadyloged){
            socket.emit('new user', response.name, response.area);
            res = response;
            $('#loginfrm').slideUp('slow'); gUser = response.name;
        }else{
            var obj = new Object();
            obj.username = username; obj.password = password; var json = JSON.stringify(obj);
            socket.emit("force-disconnect", json );
            console.log(json);
            $('.form-login').prepend('<div class="login-failed">User already loged! Unloggin it, please wait</div>');
        }
    }else{
        $('.form-login').prepend('<div class="login-failed">Password failed!</div>');
    }
}

//window.location.assign("unauthorized");
function showSmartAlert(title, message){ 
	if($('#showAlerts').is(':checked')){ 
		if (Notification.permission!=="granted"){ 
			Notification.requestPermission(); 
		} 
		var extra = { body: message }; var noti= new Notification(title,extra);
		noti.onclick = function() { 
			noti.close();
		}; 
		setTimeout(function(){ noti.close(); }, 5000); 
	} 
}

function playAudio(){
	if($('#playSound').is(':checked')){ $('#audio')[0].play(); }
}