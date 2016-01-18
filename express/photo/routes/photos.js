/**
 * Created by bt on 2016/1/15.
 */
var Photo = require('../models/Photo');
var path = require('path');
var fs = require('fs');
var join = path.join;
var photos = [];
/*photos.push({
    name:'baidu LOGO',
    path:'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/logo_white_fe6da1ec.png'
});*/
//response.render('page/pack Name',obj),向页面传递值
//还可以使用app.set(key,application)，页面通过settings.key获取，但是调用优先级低于render
/*exports.showList = function(req,res){
    res.render(
        'photos',
        {
            title:'Photos',
            photos:photos
        }
    )
};*/
//表单路由
exports.form = function(req,res){
    res.render(
        'photos/upload',
        {
            title:'Photo upload'
        }
    );
};
/*
* 处理照片提交
* 通过中间件bodyParser()中的multipart()
* 可以获得一个request.files对象，代表上传的文件，并把文件保存到硬盘
* 可以通过request.files.photo.image访问到对象
* 上传表单的输入域photo[name]可以通过request.body.photo.name访问
* 这个文件被fs.rename()传送到新的目的地，这个目的地在传给exports.submit()上
* 这个例子中，dir是app.js set方法定义的，在文件被挪到位后，一个新Photo对象呗组装出来
* */
exports.submit = function(dir){
    console.log("dir---->"+dir);
    return function (req,res,next){
        console.log("req.body---->"+req.body.photo.name);
        console.log("req.files---->"+req.file+'---'+req.file.filename);
        //mutler 单一文件 不在有req.files 而是req.file就能得到上传的文件
        var img = req.file;
        var name = req.body.photo.name || img.filename;
        var path = join(dir,img.filename);

        //重命名
        fs.rename(img.path,path,function(err){
            if(err) return next(err);

            Photo.create({
                name:name,
                path:img.filename
            },function(err){
                if(err) return next(err);
                //重定向
                res.redirect('/');
            });
        });
    };
};
//获取数据库中的数据并显示
exports.showList = function(req,res,next){
    //{}查出Photo集合中的所有集合
    Photo.find({},function(err,photos){
        if(err) return next(err);
        res.render('photos',{
            title:'Photos',
            photos:photos
        });
    });
};
//download
exports.download = function(dir){
    "use strict";
    return function(req,res,next){
        var id = req.params.id;
        Photo.findById(id,function(err,photo){
            if(err) return next(err);
            var path = join(dir,photo.path);
            //res.sendfile(path);
            res.download(path,photo.name + '.jpg');
        })
    }
};