/**
 * Created by bt on 2016/1/7.
 */
/*
* ���û������ı�����ת�룬��ֹXSS����
* */
function divEscapedContentElement(message){
    return $('<div></div>').text(message);
}
/*
* ϵͳ����������
* */
function divSystemContentElement(message){
    return $('<div></div>').html('<i>' + message + '</i>');
}
/*
* �ж��û�������Ƿ�Ϊָ��
* */
function processUserInput(chatApp,socket){
    var message = $('#send-message').val();
    var systemMessage;
    if(message.charAt(0) == '/'){
        //�����Ϊָ�����chat���processCommand��������
        systemMessage = chatApp.processCommand(message);
        //systemMessage���� ֤��ָ�����
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
* �ͻ��˳����ʼ��
* */
var socket = io.connect();
$(document).ready(function(){
    var chatApp = new Chat(socket);
    //���շ����nameResult����data
    socket.on('nameResult',function(result){
        var message;
        if(result.success){
            message = 'You are now known as ' + result.name + '.';
        }else{
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });
    //���շ����joinResult��data
    socket.on('joinResult',function(result){
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
    });
    //����message��data
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
    //�ͻ��������˷���rooms����ѭ�������÷����б��������ͻ��˷���rooms
    setInterval(function(){
        socket.emit('rooms');
    },1000);
    $('#send-message').focus();
    $('#send-form').submit(function () {
        processUserInput(chatApp,socket);
        return false;
    });
});