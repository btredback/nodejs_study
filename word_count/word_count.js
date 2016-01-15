/*
* 异步并行
* */
var fs = require('fs');
var completedTasks = 0;
var tasks = [];
var wordCounts = {};
var filesDir = './text';
/*
* 当所有任务完成后，列出文件中每个单词统计
* */
function checkIfComplete(){
    completedTasks++;
    if(completedTasks == tasks.length){
        for(var index in wordCounts){
            console.log(index + ': ' + wordCounts[index]);
        }
    }
}

/*
* 单词计数
* */
function contWordsInText(text){
    var words = text.toString().toLowerCase().split(/\W+/).sort();
    for(var index in words){
        var word = words[index];
        if(word){
            wordCounts[word] = (wordCounts[word]) ? wordCounts[word] + 1 : 1;

        }
    }
}

/*
* 得出text目录中的文件列表
* */
fs.readdir(filesDir,function(err,files){
    if(err) throw err;
    for(var index in files){
        /*
        * 定义处理每个文件的任务
        * 每个任务都会调用一个异步读取文件的函数
        * 并计数
        *
        * */
        var task = (function(file){
            return function(){
                fs.readFile(file,function(err,text){
                   if(err) throw  err;
                    contWordsInText(text);
                    checkIfComplete();
                });
            }
        })(filesDir + '/' + files[index]);
        tasks.push(task);
    }
    for(var task in tasks){
        tasks[task]();
    }
});