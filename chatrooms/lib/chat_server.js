/**
 * Created by bt on 2016/1/6.
 */
/*
* 处理基于Socket.IO的服务端聊天功能
* */
//初始化Socket.IO相关变量
var socketio = require('socket.io');
var io;
//初始化昵称编号
var guestNumber = 1;
//昵称
var nickNames = {};
//已使用昵称
var namesUsed = [];
//当前所在房间
var currentRoom = {};

/*
* 确立链接逻辑
* 定义聊天服务器函数listen，server中会调用这个函数
* 它启动Socket.IO服务器，限定socketio向控制台输出的日志详细程度
* 并去顶该如何处理每个接进来的链接
* exports对象使用表示其他文件可以引用该模块的exports属性
* exports不能被重写，想返回对象，函数等，需要用module.exports
* */
exports.listen = function(server){
    //启动socketio服务器，允许它搭载在已有的HTTP服务器上
    io = socketio.listen(server);
    io.set('log level',1);
    //每个用户链接处理逻辑
    io.sockets.on('connection',function(socket){
        //连接之后，为用户赋予一个访客名
        guestNumber = assignGuestName(socket,guestNumber,nickNames,namesUsed);
        //在用户链接上来时，把他放入聊天室Lobby里
        joinRoom(socket,'Lobby');
        //处理用户的消息，更名以及聊天室创建和变更
        //聊天逻辑
        handleMessageBroadcasting(socket,nickNames);
        //变更昵称逻辑
        handleNameChangeAttempts(socket,nickNames,namesUsed);
        //加入指定房间
        handleRoomJoining(socket);
        //用户发出请求时，向其提供已经被占用的聊天室列表
        socket.on('rooms',function(){
            socket.emit('rooms',io.sockets.manager.rooms);
        });
        //用户断开连接后的清除逻辑
        handleClientDisconnection(socket,nickNames,namesUsed);
    });
};

//分配昵称assignGuestName(socket,用户名编号，用户昵称变量，已有昵称)
function assignGuestName(socket,guestNumber,nickNames,namesUsed){
    var name = 'Guest' + guestNumber;
    //用户昵称与客户端连接ID关联socketID
    nickNames[socket.id] = name;
    //让用户知道他们的昵称
    socket.emit('nameResult',{
        success:true,
        name:name
    });
    namesUsed.push(name);
    //计数器+1
    return guestNumber + 1;

}
/*
* 进入聊天室
* jionRoom(socket,roomName)
* 用户进入房间
* 通知用户房间名
* 通知房间内其他用户，有新用户进入
* 汇总房间内其他用户信息，发送给用户
* */
function joinRoom(socket,room){
    //连接房间
    socket.join(room);
    //记录用户的当前房间
    currentRoom[socket.id] = room;
    //通知用户进入的房间名
    socket.emit('joinResult',{room:room});
    //通知其他用户，有新用户进入房间
    socket.broadcast.to(room).emit('message',{
        text:nickNames[socket.id] + 'has joined' + room +'.'
    });

    //如果不止一个用户在这个房间里，汇总下都有谁
    var usersInRoom = io.sockets.clients(room);
    if(usersInRoom.length > 1){
        //拼接所有用户信息
        var usersInRoomSummary = 'Users currently in' + room + ':';
        for(var index in usersInRoom){
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index > 0){
                    usersInRoomSummary += ',';
                }
                usersInRoomSummary += nickNames[userSocketId];
            }
        }
        usersInRoomSummary += '.';
        //将拼接完成的用户信息，发送给这个用户
        socket.emit('message',{text:usersInRoomSummary});
    }

}

/*
* 变更昵称
* handleNameChangeAttempts
* 浏览器通过socket发送请求，有接收成功或失败响应
* 服务端接收请求，处理，返回nameResult
* */
function handleNameChangeAttempts(socket,nickNames,namesUsed){
    //nameAttempt时间监听,接收客户端发送的请求字符串
    socket.on('nameAttempt',function(name){
        //判断name格式
        if(name.indexOf('Guest') == 0){
            socket.emit('nameResult',{
                success:false,
                message:'Names cannot begin with "Guest".'
            });
        }else{
            //未被占用的昵称
            if(namesUsed.indexOf(name) == -1){
                //当前socketID的昵称
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                //新昵称push进昵称库
                namesUsed.push(name);
                //与socketID绑定
                nickNames[socket.id] = name;
                //删除昵称库中的旧昵称
                delete namesUsed[previousNameIndex];
                //通知变更成功
                socket.emit('nameResult',{
                    success:true,
                    name:name
                });
                //通知房间内其他用户，昵称变更
                socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                    text:previousName + 'is now known as' + name +'.'
                });
            }else{
                //已占用的昵称，通知变更失败
                socket.emit('nameResult',{
                    success:false,
                    message:'That name is already in use.'
                });
            }
        }
    });
}

/*
* 发送聊天消息-服务端
* handleMessageBroadcasting
* 1.用户->服务端  {room:"roomName",text:"sayText"}
* 2.服务端->用户 {text:"sayPerson:sayText"}
* */
function handleMessageBroadcasting(socket){
    socket.on('message',function(message){
       socket.broadcast.to(message.room).emit('message',{
           text:nickNames[socket.id] + ':' + message.text
       });
    });
}

/*
* 加入其它指定房间
* 用户->服务端 {"newRoom":"RoomName"}
* 服务端->用户{room:"RoomName"} ---- joinRoom();
* */
function handleRoomJoining(socket){
    socket.on('join',function(room){
        //断开当前房间绑定
        socket.leave(currentRoom[socket.id]);
        //连接指定房间
        joinRoom(socket,room.newRoom);
    });
}

/*
* 断连后逻辑
*
* */
function handleClientDisconnection(socket){
    socket.on('disconnect',function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    })
}