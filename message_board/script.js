var socket = io.connect('http://104.236.239.60:8080');
// var socket = io.connect('http://127.0.0.1:8088');

socket.on('connect', function(){
  console.log('connected to howler server');

  socket.on('chat-status-update', function(is_enabled){
    updateChatStatus(is_enabled);
  });
});

var chat_elem, show_elem, additional_elem;

function init(){
  chat_elem = document.getElementById('chat_status');
  show_elem = document.getElementById('show');
  additional_elem = document.getElementById('additional')
}



function updateMessage(){
  var _s = show_elem.value.toUpperCase();
  var _a = additional_elem.value.toUpperCase();

  if(_s == ''){
    resetMessage();
  }else{
    var message = {
      show: _s,
      additional: _a
    };

    socket.emit('update-message', message);
  }
}

var isChatEnabled;
function updateChatStatus(_status){
  isChatEnabled = _status;
  if(isChatEnabled){
    chat_elem.innerText = "CHAT ENABLED";
    chat_elem.style.backgroundColor = "rgb(10, 200, 10)";
  }else{
    chat_elem.innerText = "CHAT DISABLED";
    chat_elem.style.backgroundColor = "rgb(200, 10, 10)";
  }
}

function resetMessage(){
  var message = {
    show: 'MUSIC FROM THE CLOUD',
    additional: ''
  };
  socket.emit('reset-message', message);
}

function eraseChat(){
  socket.emit('erase-chat');
}

function disableChat(){
  socket.emit('toggle-chat', false);
}

function enableChat(){
  socket.emit('toggle-chat', true);
}
