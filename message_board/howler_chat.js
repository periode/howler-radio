var express = require('express');
var http = require('http');
var path = require('path');


var app = new express();
app.set('port', 8088);

app.use(express.static(path.join(__dirname,'/public_howler')));

app.get('/', function(req, res, err){
 res.sendFile('/public_howler/message_board.html', {'root':'.'});
});

app.get('/reset_counter', function(req, res, err){
  connected_users = 0;
});

app.get('/get-offenders', function(req, res, err){
	res.json(offenders);
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('chat server started on', app.get('port'));
});


//SOCKETS
var io = require('socket.io').listen(server);
var connected_users = 0;
var is_chat_enabled = true;

var last_messages = [];
var last_users = [];

var current_message = {
   show: 'MUSIC FROM THE CLOUD',
   artist: '',
   track: '',
   additional: ''
};

var racial_slur = /n+[i1l|]+[gkq469]+[e3a4i]+[ra4]/g;
var offenders = [];

io.on('connection', function(socket){
  socket.on('error', function (err) {
    console.log("Socket.IO Error");
    console.log(err.stack);
  });

  //this gets called when someon actually clicked on the join button
  socket.on('joined-chat', function(){
    console.log('new connection!');
    connected_users += 1;

    io.emit('update-status', {users:connected_users, enabled:is_chat_enabled});

    //updating chat with the last five messages
    while(last_messages.length > 5){ //just in case they're oversize
      last_messages.splice(0, 1);
      last_users.splice(0, 1);
    }

    if(is_chat_enabled){
      //updating the last few messages only if the chat is enabled
      for(var i = 0; i < last_users.length; i++){
        socket.emit('update-chat', {username: last_users[i], message: last_messages[i]});
      }
    }
  });



  //handle new message
  socket.on('new-message', function(data){

    if(racial_slur.test(data.message) || racial_slur.test(data.username)){
	     var offender = socket.handshake;
	    offenders.push(offender);
	    console.log(JSON.stringify(offender));
	    socket.disconnect(true);
	    return;
    }
    console.log(data.username+" said: "+data.message);

    //store the new message
    last_messages.push(data.message);
    last_users.push(data.username);

    if(last_messages.length > 5){
      last_messages.splice(0, 1);
      last_users.splice(0, 1);
    }

    if(!is_chat_enabled){
      data.message = "sorry, the chat is currently disabled.";
      data.username = "robot";
    }

    //send it to everyone
    io.emit('update-chat', data);
  });

  //decrement users on disconnect
  socket.on('disconnect', function(){
    if(connected_users > 1)
      connected_users--;

    io.emit('update-status', {users:connected_users, status:is_chat_enabled});
  });


  //--MESSAGE BOARD
  io.sockets.emit('update-message', current_message);

  socket.on('update-message', function(data){
    current_message = data;
    io.sockets.emit('update-message', current_message);
  });

  socket.on('reset-message', function(data){
    current_message = data;
    io.sockets.emit('reset-message', current_message);
  });


  //--CHAT CONTROL
  socket.on('erase-chat', function(){
    io.emit('erase', 0);
    last_messages = [];
    last_users = [];
  });

  socket.on('toggle-chat', function(chat_status){
    is_chat_enabled = chat_status;

    //update everybody on whether the chat has been enabled or disabled recently
    io.emit('chat-status-update', is_chat_enabled);
  });
});
