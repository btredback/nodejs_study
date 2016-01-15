/**
 * Created by bt on 2016/1/6.
 */
/*
* 创建静态文件服务器
* 使用node内置功能和mime模块
* */
//内置的http模块提供HTTP服务器和客户端功能
var http = require('http');
var fs = require('fs');
//内置的path模块提供与文件系统路径相关的功能
var path = require('path');
//依赖中引入的mime模块，根据文件扩展名得出MIME类型
var mime = require('mime');
//cache用来缓存文件内容的对象
var cache = {};

/*
* 三个辅助函数以提供静态HTTP文件服务
* */
//404错误
function send404(response){
    response.writeHead(404,{'Content-Type':'text/plain'});
    response.write('Error 404 : resource not found.');
    response.end();
}
//文件数据服务:1.http头 2.发送文件内容
function sendFile(response,filePath,fileContents){
    response.writeHead(200,{"content-type":mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}
//判断是在内存读取还是硬盘读取
function serveStatic(response,cache,absPath){
    //判断文件是否缓存在内存中
    if(cache[absPath]){
        //从内存中返回文件
        sendFile(response,absPath,cache[absPath]);
    }else{
        fs.exists(absPath,function(exists){
            //判断文件是否存在
            if(exists){
                //在硬盘中读取
                fs.readFile(absPath,function(error,data){
                    if(error){
                        //抛出错误，返回404页面
                        send404(response);
                    }else{
                        //从硬盘中读取的数据，放入缓存，并返回文件
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
* 创建HTTP服务器
* createServer
* */
var server = http.createServer(function(request,response){
    //定义对每个请求的处理行为
    var filePath = false;
    if(request.url == '/'){
        //返回默认的html文件
        filePath = 'public/index.html';
    }else{
        filePath = 'public' + request.url;
    }
    //相对路径
    var absPath = './' + filePath;
    //返回静态文件
    serveStatic(response,cache,absPath);
});

/*
* 启动HTTP服务器
* 监听响应的端口
* */
server.listen(3000,function(){
    console.log("Server listening on port 3000.");
});

//socketio相关模块
/*
 * 加载一个定制的node模块
 * 它提供的逻辑用来处理基于Socket.IO的服务端聊天功能
 * */
var chatServer = require('./lib/chat_server');
chatServer.listen(server);
