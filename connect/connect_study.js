/**
 * Created by bt on 2016/1/13.
 */
var connect = require('connect');
/*
* connect(require,response,next)
* */
var app = connect();
//app.use(logger).use(hello);
app.use(logger);
//当use第一个参数是字符串时，只有URL前缀与之匹配时 才会调用后面的
app.use('/admin',restrict);
app.use('/admin',admin);
app.use(hello);
app.listen(3000,function(){
    console.log("start!");
});

function logger(req,res,next){
    console.log('&s %s',req.method,req.url);
    next();
}

function hello(req,res){
    res.setHeader('Content-Type','text/plain');
    res.end('Hello World!');
}

//basic认证luoji
function restrict(req,res,next){
    var authorization = req.headers.authorization;
    if(!authorization) return next(new Error('Unauthorized'));

    var parts = authorization.split(' ');
    var scheme = parts[0];
    var auth = new Buffer(parts[1],'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];
    //根据数据库中的信息验证
    authenticateWithDatabase(user,pass,function(err){
        if(err) return next(err);

        next();
    });
}

//调用中间件前，connect从req.url去掉了前缀，就像URL挂载在/上一样
function admin(req,res,next){
    switch (req.url){
        case '/':
            res.end('try /users');
            break;
        case  '/users':
            res.setHeader('Content-Type','application/json');
            res.end(JSON.stringify(['tobi','loki','jane']));
            break;
    }
}