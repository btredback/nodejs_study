/**
 * Created by bt on 2016/1/12.
 */
var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');

//__dirname可以得到文件所在目录
var root = __dirname;
var server = http.createServer(function(req,res){
        var url = parse(req.url);
        var path = join(root,url.pathname);
        //检查文件是否存在
        fs.stat(path,function(err,stat){
            if(err){
                if('ENOENT' == err.code){
                    res.statusCode = 404;
                    res.end('Not found');
                }else{
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            }else{
                res.setHeader('Content-Length',stat.size);
                var stream = fs.createReadStream(path);
                //res.end会再stream.pipe内部调用
                stream.pipe(res);
                //防止服务器被错误搞垮，需要监听错误
                stream.on('error',function(err){
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                });
            }
        })
        //fs.ReadStream读取文件时会发出data事件
        /*var stream = fs.ReadStream(path);
        stream.on('data',function(chunk){
            res.write(chunk);
        });
        stream.on('end',function(){
            res.end();
        });*/
        //ReadableStream数据源->WritableStream数据目的=>通过ReadableStream.pipe(WritableStream)
        //request请求对象就是ReadableStream
       /* //上面代码可以优化为
        var stream = fs.createReadStream(path);
        //res.end会再stream.pipe内部调用
        stream.pipe(res);
        //防止服务器被错误搞垮，需要监听错误
        stream.on('error',function(err){
            res.statusCode = 500;
            res.end('Internal Server Error');
        });*/
    }
);
server.listen(3000,function(){
    console.log('server start:3000');
});
