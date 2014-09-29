var gulp = require('gulp');
var rename = require("gulp-rename");
var http=require('http');
var fs=require('fs');
var mkdirp=require('mkdirp');
var path=require('path');

var config={
    targets:{
        "http://192.168.1.5:3000/":"abc/test.txt",//配置要GET请求的URL以及保存到的文件的地址
    },
    saveDir:"E:/jeff/git/tools/template/", //保存的目录地址
    tmpDir:'E:/jeff/git/tools/tmp/'   //临时文件的目录，用于备份之前的文件
};


//将可能要覆盖的文件先重命名后保存到tmpDir
gulp.task('dev-renameFile',function(){
    for(var url in config.targets){
        gulp.src(config.saveDir+config.targets[url])
            .pipe(rename({
                dirname:path.dirname(config.targets[url]),
                prefix:(+new Date)+'_'
            }))
            .pipe(gulp.dest(config.tmpDir));
    }
});

//使用Post请求URL然后将请求到的内容写入到文件
//todo 这里的代码太惨了，看下如何写自定义的GULP插件实现
gulp.task('dev-writeUrlContentToFile',['dev-renameFile'],function(){
    for(var url in config.targets){
        (function(outputUrl){
            mkdirp(path.dirname(outputUrl),function(){
                http.get(url, function (serverFeedback) {
                    if (serverFeedback.statusCode == 200) {
                        var body = "";
                        serverFeedback.on('data', function (data) {
                            body += data;
                        }).on('end', function () {
                            fs.writeFile(outputUrl,body,function(err){
                                if (err) throw err;
                                console.log(url,'saved to ',outputUrl);
                            });
                        });
                    }
                    else {
                        console.log('error');
                    }
                });
            });
        })(config.saveDir+config.targets[url]);
    }
});



gulp.task('default', ['dev-writeUrlContentToFile']);

