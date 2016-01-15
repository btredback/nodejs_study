/**
 * Created by bt on 2016/1/6.
 */
/*
* ������̬�ļ�������
* ʹ��node���ù��ܺ�mimeģ��
* */
//���õ�httpģ���ṩHTTP�������Ϳͻ��˹���
var http = require('http');
var fs = require('fs');
//���õ�pathģ���ṩ���ļ�ϵͳ·����صĹ���
var path = require('path');
//�����������mimeģ�飬�����ļ���չ���ó�MIME����
var mime = require('mime');
//cache���������ļ����ݵĶ���
var cache = {};

/*
* ���������������ṩ��̬HTTP�ļ�����
* */
//404����
function send404(response){
    response.writeHead(404,{'Content-Type':'text/plain'});
    response.write('Error 404 : resource not found.');
    response.end();
}
//�ļ����ݷ���:1.httpͷ 2.�����ļ�����
function sendFile(response,filePath,fileContents){
    response.writeHead(200,{"content-type":mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}
//�ж������ڴ��ȡ����Ӳ�̶�ȡ
function serveStatic(response,cache,absPath){
    //�ж��ļ��Ƿ񻺴����ڴ���
    if(cache[absPath]){
        //���ڴ��з����ļ�
        sendFile(response,absPath,cache[absPath]);
    }else{
        fs.exists(absPath,function(exists){
            //�ж��ļ��Ƿ����
            if(exists){
                //��Ӳ���ж�ȡ
                fs.readFile(absPath,function(error,data){
                    if(error){
                        //�׳����󣬷���404ҳ��
                        send404(response);
                    }else{
                        //��Ӳ���ж�ȡ�����ݣ����뻺�棬�������ļ�
                        cache[absPath] = data;
                        sendFile(response,absPath,data);
                    }
                });
            }else{
                send404(response);
            }
        });
    }
}

/*
* ����HTTP������
* createServer
* */
var server = http.createServer(function(request,response){
    //�����ÿ������Ĵ�����Ϊ
    var filePath = false;
    if(request.url == '/'){
        //����Ĭ�ϵ�html�ļ�
        filePath = 'public/index.html';
    }else{
        filePath = 'public' + request.url;
    }
    //���·��
    var absPath = './' + filePath;
    //���ؾ�̬�ļ�
    serveStatic(response,cache,absPath);
});

/*
* ����HTTP������
* ������Ӧ�Ķ˿�
* */
server.listen(3000,function(){
    console.log("Server listening on port 3000.");
});

//socketio���ģ��
/*
 * ����һ�����Ƶ�nodeģ��
 * ���ṩ���߼������������Socket.IO�ķ�������칦��
 * */
var chatServer = require('./lib/chat_server');
chatServer.listen(server);
