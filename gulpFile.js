/**
 * Gulp Setting v0.1.1
 * @ahther 디스타일(마봉아빠 , dstyle0210@gmail.com)
 * @url : https://dstyle0210.github.io/gulp-setting/
 * @blog : http://dstyleitsme.tistory.com
 */

'use strict';

var gulp = require('gulp');
var path = require('path');
var sass = require('gulp-sass');
var less = require('gulp-less');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var csscomb = require('gulp-csscomb');
var insert = require('gulp-insert');
var runSequence = require('run-sequence');
var folders = require('gulp-folders');
var replace = require('gulp-replace');
var clean = require('gulp-clean');

// 환경설정
var srcPath = {};
srcPath.root = ".";
srcPath.css = srcPath.root+"/css";
srcPath.scss = srcPath.root+"/scss";
srcPath.less = srcPath.root+"/less";

var distPath = {};
distPath.root = "./dist";
distPath.css = distPath.root+"/css";

var request = require("request");
gulp.task("test",function(){
    var html = request.get("http://localhost:63342/sneaker/src/index.html").pipe(function(data){
        console.log(data);
    });
    console.log(html);
    // require('fs').writeFileSync('src/sneakers/123456-123.html', '<html><head></head><body>123456-123</body></html>');
});



/*! Default */
gulp.task("default",function(callback){
    runSequence("build","watch",callback);
});
gulp.task("dist",function(callback){
    runSequence("css:dist",callback);
});
gulp.task("build",function(callback){
    runSequence("scss:build","less:build","css:concat",callback);
});
gulp.task("watch",function(callback){
    runSequence("scss:watch","less:watch","css:watch",callback);
});
gulp.task("scss",function(callback){
    runSequence("scss:build","scss:watch",callback);
});
gulp.task("less",function(callback){
    runSequence("less:build","less:watch",callback);
});
gulp.task("css",function(callback){
    runSequence("css:concat","css:watch",callback);
});
gulp.task("scss:build",function(){
    return pipeLineScss( gulp.src(srcPath.scss+"/**/*.scss",{"base":srcPath.scss}) );
});
gulp.task("less:build",function(){
    return pipeLineLess( gulp.src(srcPath.less+"/**/*.less",{"base":srcPath.less}) );
});
gulp.task("css:concat", folders(srcPath.css, function(folder){
    return pipeLineConcatCSS( gulp.src(path.join(srcPath.css, folder, '*.css')) , folder + '.css' );
}));
gulp.task("scss:watch",function(){
    return gulp.watch(srcPath.scss+"/**/*.scss").on("change",function(file){
        var base = path.parse(file.path).base;
        pipeLineScss( gulp.src(file.path,{"base":srcPath.scss}) );
        console.log(getTimeStamp() + " [sass:watch] "+base+" changed");
    });
});
gulp.task("less:watch",function(){
    return gulp.watch(srcPath.less+"/**/*.less").on("change",function(file){
        var base = path.parse(file.path).base;
        pipeLineLess( gulp.src(file.path,{"base":srcPath.less}) );
        console.log(getTimeStamp() + " [less:watch] "+base+" changed");
    });
});
gulp.task("css:watch",function(){
    return gulp.watch([srcPath.css+"/**/*.css","!"+srcPath.css+"/*.css"]).on("change",function(file){
        var folder = getFolder(file);
        pipeLineConcatCSS( gulp.src(srcPath.css+"/"+folder+"/*.css") , folder+'.css' );
        console.log(getTimeStamp() + " [css:watch] "+folder+".css concated");
    });
});
gulp.task("css:dist",function(){
    gulp.src(distPath.css+"/*.css").pipe(clean());
    gulp.src([srcPath.css+"/*.css","!"+srcPath.css+"/_*.css"])
        .pipe(csso())
        .pipe(replace(/}/g,'}\n'))
        .pipe(replace('/*!','\n/*!'))
        .pipe(replace('{.','{\n\t.'))
        .pipe(replace('"UTF-8";','"UTF-8";\n'))
        .pipe(gulp.dest(distPath.css));
});

// 메소드 만들기
function getFolder(file){
    return path.parse( path.parse(file.path).dir ).base;
};
function getTimeStamp() {
    var now = new Date();
    return "["+(now.getHours() + ':' +((now.getMinutes() < 10)? ("0" + now.getMinutes()): (now.getMinutes())) + ':' +((now.getSeconds() < 10)? ("0" + now.getSeconds()): (now.getSeconds())))+"]";
}

/*! 중복 pipe */
function pipeLineScss(gulpFiles){
    return gulpFiles.pipe(sass({indentType:"tab",indentWidth:1}).on('error', sass.logError))
        .pipe(csscomb())
        .pipe(replace('@charset "UTF-8";',''))
        .pipe(insert.prepend('@charset "UTF-8";\n'))
        .pipe(gulp.dest(srcPath.css));
};
function pipeLineLess(gulpFiles){
    return gulpFiles.pipe(less())
        .pipe(csscomb())
        .pipe(replace('@charset "UTF-8";',''))
        .pipe(insert.prepend('@charset "UTF-8";\n'))
        .pipe(gulp.dest(srcPath.css));
};
function pipeLineConcatCSS(gulpFiles,folderName){
    return gulpFiles.pipe(concat(folderName))
        .pipe(replace('@charset "UTF-8";',''))
        .pipe(insert.prepend('@charset "UTF-8";\n'))
        .pipe(gulp.dest(srcPath.css));
};