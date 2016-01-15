/**
 * Created by bt on 2016/1/7.
 */
/*
* 将用户输入文本进行转码，防止XSS攻击
* */
function divEscapedContentElement(message){
    return $('<div></div>').text(message);
}
/*
* 系统创建的内容
* */
function divSystemContentElement(message){
    return $('<div></div>').html('<i>' + message + '</i>');
}
/*
* 判断用户输入的是否为指令
* */
function processUserInput(chatApp,socket){
    var message = $('#send-message').val();
    var systemMessage;
    if(message.charAt(0) == '/'){
        //输入的为指令，交给chat类的processCommand方法处理
        systemMessage = chatApp.processCommand(message);
        //systemMessage存在 证明指令错误
        if(systemMessage){
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    }else{
        chatApp.sendMessage($('#room').text,message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }
    $('#send-message').val('');
}

/*
* 客户端程序初始化
* */
var socket = io.connect();
$(document).ready(function(){
    var chatApp = new Chat(socket);
    //接收服务端nameResult传的data
    socket.on('nameResult',function(result){
        var message;
        if(result.success){
            message = 'You are now known as ' + result.name + '.';
        }else{
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });
    //接收服务端joinResult的data
    socket.on('joinResult',function(result){
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
    });
    //接收message的data
    socket.on('message',function(message){
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });
    //rooms
    socket.on('rooms',function(rooms){
        $('#room-list').empty();
        for(var room in rooms){
            room = room.substring(1,room.length);
            if(room != ''){
                $('#room-list').append(divEscapedContentElement(room));
            }
        }
        $('#room-list div').click(function(){
            chatApp.processCommand('/join' + $(this).text());
            $('#send-message').focus();
        });
    });
    //客户端向服务端发送rooms请求，循环检查可用房间列表，服务端向客户端返回rooms
    setInterval(function(){
        socket.emit('rooms');
    },1000);
    $('#send-message').focus();
    $('#send-form').submit(function () {
        processUserInput(chatApp,socket);
        return false;
    });
});