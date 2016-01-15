/**
 * Created by bt on 2016/1/11.
 */
var http = require('http');
var url = require('url');
var items = [];

var server = http.createServer(function(req,res){
    //req.mothod 请求所用的方法
    switch (req.method){
        case 'POST':
            var item = '';
            req.setEncoding('utf8');
            req.on('data',function(chunk){
                item += chunk;
            });
            req.on('end',function(){
                //end触发说明数据读完，将一条todo压入数组总
                items.push(item);
                //res.end('text') -> res.write('text');res.end();
                res.end('OK\n');
            });
            break;
        case 'GET':
           /* items.forEach(function(item,i){
                res.write(i + '.' + item + '\n');
            });
            res.end();*/
            var body = items.map(function(item,i){
                return i + ')' + item;
            }).join('\n');
            //设定content-length域 隐含禁用node块编码，使得传输数据更少
            res.setHeader('Content-Length',Buffer.byteLength(body));
            res.setHeader('Content-Type','text/plain;charset="utf-8"');
            res.end(body);
            break;
        case  'DELETE':
            var path = url.parse(req.url).pathname;
            var i = parseInt(path.slice(1),10);

            if(isNaN(i)){
                res.statusCode = 404;
                res.end('Invalid item id');
            }else if(!items[i]){
                res.statusCode = 404;
                res.end('item not found');
            }else{
                items.splice(i,1);
                res.end('delete->'+i+'.OK\n');
                break;
            }
            break;
        case 'PUT':
            var path = url.parse(req.url).pathname;
            var i = parseInt(path.slice(1),10);
            var item = '';

            if(isNaN(i)){
                res.statusCode = 404;
                res.end('Invalid item id');
            }else if(!items[i]){
                res.statusCode = 404;
                res.end('item not found');
            }else{
                req.setEncoding('utf8');
                req.on('data',function(chunk){
                    item += chunk;
                });
                req.on('end',function(){
                    //end触发说明数据读完，将一条todo压入数组总
                    items[i] = item;
                    //res.end('text') -> res.write('text');res.end();
                    res.end('OK\n');
                });
            }
            break;

    }

});
server.listen('3000',function(){
    console.log('server start:3000');
});