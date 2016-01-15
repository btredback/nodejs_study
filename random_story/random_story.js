/**
 * Created by bt on 2016/1/8.
 */
var fs = require('fs');
var request = require('request');
var htmlparser = require('htmlparser');
var configFilename = './rss_feeds.txt';

function checkForRSSFile(){
    //检查文件存在
    fs.exists(configFilename,function(exists){
        if(!exists) return next(new Error('Missing RSS file:' + configFilename));
        next(null,configFilename);
    });

}
/*
* 解析
* */
function readRSSFile(configFilename){
    fs.readFile(configFilename,function(err,feedList){
        if(err) return next(err);
        //URL列表转换成字符串，分割成一个数组
        feedList = feedList
                        .toString()
                        .replace(/^\s+|\s+$/g,'')
                        .split("\n");
        var random = Math.floor(Math.random() * feedList.length);
        next(null,feedList[random]);
    });
}

/*
* 向选中的URL发送请求
* */
function downloadRSSFeed(feedUrl){
    request({uri:feedUrl},function(err,res,body){
        if(err) return next(err);
        if(res.statusCode != 200){
            return next(new Error('not found'))
        }
        next(null,body);
    });
}
/*
* 解析预订源数据到一个条目数组中
* */
function parseRSSFeed(rss){
    var handler = new htmlparser.RssHandler();
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rss);
    if(!handler.dom.items.length) return next(new Error('No RSS items found'));
    var  item = handler.dom.items.shift();
    console.log(item.tile);
    console.log(item.link);
}

/*
* 执行顺序数组
* */
var tasks = [
    checkForRSSFile,
    readRSSFile,
    downloadRSSFeed,
    parseRSSFeed
]
/*
* 执行顺序逻辑 next
* */
function next(err,result){
    if(err) throw err;
    var currentTask =  tasks.shift();
    if(currentTask){
        currentTask(result);
    }
}

next();