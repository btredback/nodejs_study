/*
* �첽����
* */
var fs = require('fs');
var completedTasks = 0;
var tasks = [];
var wordCounts = {};
var filesDir = './text';
/*
* ������������ɺ��г��ļ���ÿ������ͳ��
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
* ���ʼ���
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
* �ó�textĿ¼�е��ļ��б�
* */
fs.readdir(filesDir,function(err,files){
    if(err) throw err;
    for(var index in files){
        /*
        * ���崦��ÿ���ļ�������
        * ÿ�����񶼻����һ���첽��ȡ�ļ��ĺ���
        * ������
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