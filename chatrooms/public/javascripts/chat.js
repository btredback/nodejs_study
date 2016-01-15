/**
 * Created by bt on 2016/1/7.
 */
/*
* 客户端
* 向服务端发送用户请求：消息，昵称/房间变更
* 请求其它用户信息及房间列表
* */

var Chat = function(socket){
    this.socket = socket;
};

Chat.prototype.sendMessage = function(room,text){
    var message = {
        room:room,
        text:text
    };
    this.socket.emit('message',message);
};
Chat.prototype.changeRoom = function(room){
    this.socket.emit('join',{
        newRoom:room
    });
};
//处理用户指令
Chat.prototype.processCommand = function(command){
   var words = command.split(' ');
    var command = words[0].substring(1,words[0].length).toLowerCase();
    var message = false;
    switch(command){
        case 'join':
            words.shift();
            var room = words.join(' ');
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.socket.emit('nameAttempt',name);
            break;
        default :
            message = 'Unrecognized command.';
            break;
    }
    return message;
};