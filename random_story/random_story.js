/**
 * Created by bt on 2016/1/8.
 */
var fs = require('fs');
var request = require('request');
var htmlparser = require('htmlparser');
var configFilename = './rss_feeds.txt';

function checkForRSSFile(){
    //����ļ�����
    fs.exists(configFilename,function(exists){
        if(!exists) return next(new Error('Missing RSS file:' + configFilename));
        next(null,configFilename);
    });

}
/*
* ����
* */
function readRSSFile(configFilename){
    fs.readFile(configFilename,function(err,feedList){
        if(err) return next(err);
        //URL�б�ת�����ַ������ָ��һ������
        feedList = feedList
                        .toString()
                        .replace(/^\s+|\s+$/g,'')
                        .split("\n");
        var random = Math.floor(Math.random() * feedList.length);
        next(null,feedList[random]);
    });
}

/*
* ��ѡ�е�URL��������
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
* ����Ԥ��Դ���ݵ�һ����Ŀ������
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
* ִ��˳������
* */
var tasks = [
    checkForRSSFile,
    readRSSFile,
    downloadRSSFeed,
    parseRSSFeed
]
/*
* ִ��˳���߼� next
* */
function next(err,result){
    if(err) throw err;
    var currentTask =  tasks.shift();
    if(currentTask){
        currentTask(result);
    }
}

next();