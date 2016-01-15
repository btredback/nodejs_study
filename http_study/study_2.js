/**
 * Created by bt on 2016/1/11.
 */
/*
* RESTful 服务
* */
var http = require('http');

var server = http.createServer(function(req,res){
    //流编码设置
    req.setEncoding('utf8');
   //data事件，读入新数据块就会传
    req.on('data',function(chunk){
        //数据块默认是字节数组 buffer对象
        //可以通过设置setEncoding改变流编码,使其成为utf8字符串
        console.log('parsed',chunk);
    });
    //数据读完会触发end事件
    req.on('end',function(){
        console.log('parsed end');
        res.end();
    });
});