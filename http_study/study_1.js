/**
 * Created by bt on 2016/1/11.
 */
/*
* helloworld
* */
//加载http包
var http = require('http');
//调用http.createServer处理请求响应
var server  = http.createServer(function(req,res){
    var say = 'hello world!';
    //添加响应头res.setHeader res.removeHeader(field),res.getHeader(field)
    res.setHeader('Content-Length',say.length);
    res.setHeader('Content_Type','text/plain');
    //res.statusCode状态码设置
    res.statusCode = 302;
    res.write(say);
    res.end();
});
//监听端口
server.listen('3000',function(){
    console.log('server start:3000');
});
//node study_1.js 打开浏览器3000端口