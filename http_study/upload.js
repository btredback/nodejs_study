/**
 * Created by bt on 2016/1/13.
 */
var http = require('http');
var formidable = require('formidable');
var server = http.createServer(function(req,res){
    switch (req.method){
        case 'GET':
            show(req,res);
            break;
        case 'POST':
            upload(req,res);
            break;
    }
});

function show(req,res){
    var html = ''
            + '<form method="post" action="/" enctype="multipart/form-data" >'
            + '<p><input type="text" name="name" /></p> '
            + '<p><input type="file" name="file" /></p> '
            + '<p><input type="submit" value="upload" /></p>'
            +'</form>';
    res.setHeader('Content-Type','text/html');
    res.setHeader('Content-Length',Buffer.byteLength(html));
    res.end(html);
}

function upload(req,res){
    if(!isFormData(req)){
        res.statusCode = 400;
        res.end('Bad Request :expecting multipart/form-data');
        return;
    }
    var form = new formidable.IncomingForm();
    //progress事件给出收到的字节数以及期望收到的字节数
    form.on('progress',function(bytesReceived,bytesExpected){
        var percent = Math.floor(bytesReceived / bytesExpected * 100);
        console.log(percent);
    });
    form.parse(req,function(err,fields,files){
        console.log(fields);
        console.log(files);
        res.end('upload complete!');
    });

}
function isFormData(req){
    var type = req.headers['content-type'] || '';
    return 0 == type.indexOf('multipart/form-data');
}

server.listen(3000,function(){
    console.log('server start:3000');
});
