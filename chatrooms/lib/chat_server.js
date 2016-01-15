/**
 * Created by bt on 2016/1/6.
 */
/*
* �������Socket.IO�ķ�������칦��
* */
//��ʼ��Socket.IO��ر���
var socketio = require('socket.io');
var io;
//��ʼ���ǳƱ��
var guestNumber = 1;
//�ǳ�
var nickNames = {};
//��ʹ���ǳ�
var namesUsed = [];
//��ǰ���ڷ���
var currentRoom = {};

/*
* ȷ�������߼�
* �����������������listen��server�л�����������
* ������Socket.IO���������޶�socketio�����̨�������־��ϸ�̶�
* ��ȥ������δ���ÿ���ӽ���������
* exports����ʹ�ñ�ʾ�����ļ��������ø�ģ���exports����
* exports���ܱ���д���뷵�ض��󣬺����ȣ���Ҫ��module.exports
* */
exports.listen = function(server){
    //����socketio�����������������������е�HTTP��������
    io = socketio.listen(server);
    io.set('log level',1);
    //ÿ���û����Ӵ����߼�
    io.sockets.on('connection',function(socket){
        //����֮��Ϊ�û�����һ���ÿ���
        guestNumber = assignGuestName(socket,guestNumber,nickNames,namesUsed);
        //���û���������ʱ����������������Lobby��
        joinRoom(socket,'Lobby');
        //�����û�����Ϣ�������Լ������Ҵ����ͱ��
        //�����߼�
        handleMessageBroadcasting(socket,nickNames);
        //����ǳ��߼�
        handleNameChangeAttempts(socket,nickNames,namesUsed);
        //����ָ������
        handleRoomJoining(socket);
        //�û���������ʱ�������ṩ�Ѿ���ռ�õ��������б�
        socket.on('rooms',function(){
            socket.emit('rooms',io.sockets.manager.rooms);
        });
        //�û��Ͽ����Ӻ������߼�
        handleClientDisconnection(socket,nickNames,namesUsed);
    });
};

//�����ǳ�assignGuestName(socket,�û�����ţ��û��ǳƱ����������ǳ�)
function assignGuestName(socket,guestNumber,nickNames,namesUsed){
    var name = 'Guest' + guestNumber;
    //�û��ǳ���ͻ�������ID����socketID
    nickNames[socket.id] = name;
    //���û�֪�����ǵ��ǳ�
    socket.emit('nameResult',{
        success:true,
        name:name
    });
    namesUsed.push(name);
    //������+1
    return guestNumber + 1;

}
/*
* ����������
* jionRoom(socket,roomName)
* �û����뷿��
* ֪ͨ�û�������
* ֪ͨ�����������û��������û�����
* ���ܷ����������û���Ϣ�����͸��û�
* */
function joinRoom(socket,room){
    //���ӷ���
    socket.join(room);
    //��¼�û��ĵ�ǰ����
    currentRoom[socket.id] = room;
    //֪ͨ�û�����ķ�����
    socket.emit('joinResult',{room:room});
    //֪ͨ�����û��������û����뷿��
    socket.broadcast.to(room).emit('message',{
        text:nickNames[socket.id] + 'has joined' + room +'.'
    });

    //�����ֹһ���û����������������¶���˭
    var usersInRoom = io.sockets.clients(room);
    if(usersInRoom.length > 1){
        //ƴ�������û���Ϣ
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
        //��ƴ����ɵ��û���Ϣ�����͸�����û�
        socket.emit('message',{text:usersInRoomSummary});
    }

}

/*
* ����ǳ�
* handleNameChangeAttempts
* �����ͨ��socket���������н��ճɹ���ʧ����Ӧ
* ����˽������󣬴�������nameResult
* */
function handleNameChangeAttempts(socket,nickNames,namesUsed){
    //nameAttemptʱ�����,���տͻ��˷��͵������ַ���
    socket.on('nameAttempt',function(name){
        //�ж�name��ʽ
        if(name.indexOf('Guest') == 0){
            socket.emit('nameResult',{
                success:false,
                message:'Names cannot begin with "Guest".'
            });
        }else{
            //δ��ռ�õ��ǳ�
            if(namesUsed.indexOf(name) == -1){
                //��ǰsocketID���ǳ�
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                //���ǳ�push���ǳƿ�
                namesUsed.push(name);
                //��socketID��
                nickNames[socket.id] = name;
                //ɾ���ǳƿ��еľ��ǳ�
                delete namesUsed[previousNameIndex];
                //֪ͨ����ɹ�
                socket.emit('nameResult',{
                    success:true,
                    name:name
                });
                //֪ͨ�����������û����ǳƱ��
                socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                    text:previousName + 'is now known as' + name +'.'
                });
            }else{
                //��ռ�õ��ǳƣ�֪ͨ���ʧ��
                socket.emit('nameResult',{
                    success:false,
                    message:'That name is already in use.'
                });
            }
        }
    });
}

/*
* ����������Ϣ-�����
* handleMessageBroadcasting
* 1.�û�->�����  {room:"roomName",text:"sayText"}
* 2.�����->�û� {text:"sayPerson:sayText"}
* */
function handleMessageBroadcasting(socket){
    socket.on('message',function(message){
       socket.broadcast.to(message.room).emit('message',{
           text:nickNames[socket.id] + ':' + message.text
       });
    });
}

/*
* ��������ָ������
* �û�->����� {"newRoom":"RoomName"}
* �����->�û�{room:"RoomName"} ---- joinRoom();
* */
function handleRoomJoining(socket){
    socket.on('join',function(room){
        //�Ͽ���ǰ�����
        socket.leave(currentRoom[socket.id]);
        //����ָ������
        joinRoom(socket,room.newRoom);
    });
}

/*
* �������߼�
*
* */
function handleClientDisconnection(socket){
    socket.on('disconnect',function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    })
}