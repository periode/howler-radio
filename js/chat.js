var socket = io.connect('http://104.236.239.60:8080');

socket.on('connect', function(){
  console.log('connected to the chat server');
  document.getElementById("chat_window").innerHTML = "<span style='color:grey; font-size: 0.8em;'>...you're connected. say hi! (displaying the last few messages)</span>";
});

socket.on('update-users', function(data){
  document.getElementById('connected_users').innerHTML = '('+data+')';
});

socket.on('update-chat', function(data){
  if(document.getElementById("chat_window").innerHTML == "<span style='color:grey;'>...you're connected. say hi!</span>")
    document.getElementById("chat_window").innerHTML = "";


  document.getElementById("chat_window").innerHTML = "<span class='username'>"+data.username + "</span> " + data.message +"<hr>" + document.getElementById("chat_window").innerHTML;
});

window.onload = function(){
  document.getElementById('message').addEventListener('keypress', function(e){

    e = e || window.event;

    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    if (charCode == 13) {
        sendMessage();
    }
  });
};


function sendMessage(){
  var _name = document.getElementById("username").value;
  var _message = document.getElementById("message").value;

  if(_name.toString() === ""){
    _name = "anonymous";
  }

  var data = {"username":_name, "message":_message};
  socket.emit('new-message', data);


  //clear the values only for message
  document.getElementById("message").value = "";
}
