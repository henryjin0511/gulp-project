require('events').EventEmitter.prototype._maxListeners = 100;   //默认的观察者数量为10，这里我们向上调整为100
var gulp = require('gulp'),  //gulp主程序
	runSequence = require('run-sequence'),  //按顺序处理任务
	browserSync = require('browser-sync').create(),  //浏览器自动刷新
	sass = require('gulp-sass'),  //scss文件编译
	scsslint  = require('gulp-scss-lint'),  //scss代码风格检查
	autoprefixer  = require('gulp-autoprefixer'),  //css兼容补全
	cleanCSS = require('gulp-clean-css'),  //css压缩
	uglify = require('gulp-uglify'),  //js压缩
	concat = require('gulp-concat'),  //资源合并
	sourcemaps = require('gulp-sourcemaps'),  //scss map文件生成
	spritesmith = require('gulp.spritesmith'),  //sprite图片合成
	rev = require('gulp-rev'),  //自动添加资源版本号
	del = require('del'),  //删除文件
	useref = require('gulp-useref'),  //css，js资源合并路径替换
	revCollector = require('gulp-rev-collector'),  //自动更换页面内版本号
	makeUrlVer = require('gulp-make-css-url-version'),  //自动增加css文件中引入的图片文件MD5后缀强制清除缓存
	replace = require('gulp-replace'),  //文件路径替换
	imagemin = require('gulp-imagemin'),  //图片压缩
	minifyHtml = require('gulp-htmlmin');	//html压缩

var project_base_dev = './src/',  //静态资源文件夹输入夹路径
	project_base_output_local = './dist/',  //静态资源文件夹输出路径
	htmlSrc = './src/view/*.html',  //视图文件输入路径
	htmlDest = './dist/view/',  //视图文件输出路径
	imgSrc = project_base_dev+'img/**/*.*',  //图片文件输入路径
	imgDest = project_base_output_local + 'img/',  //图片文件输出路径
	scssSrc = project_base_dev+'css/*.scss',  //scss文件输入路径
	scssDest = project_base_dev + 'css/',  //scss文件编译输出路径
	cssMinSrc = project_base_dev+'css/*.css',  //css需要压缩的文件输入路径
	cssConName = 'index.css',  //css需要合并文件名称
	cssConSrc = project_base_output_local+'css/*.css',  //css需要合并文件输入路径
	cssDest = project_base_output_local+'css/',  //css文件输出路径
	jsMinSrc = project_base_dev+'js/*.js',  //js需要压缩文件输入路径
	jsConName = 'index.js',  //js需要合并文件名称
	jsConSrc = project_base_dev+'js/*.js',  //js需要合并文件输入路径
	jsDest = project_base_output_local+'js/',  //js文件输出路径
	fontsSrc = project_base_dev + 'fonts/**/*.*',  //fonts文件输入路径
	fontsDest = project_base_output_local+'fonts/',  //fonts文件输出路径
	revDelSrc = project_base_output_local+'rev',  //临时储存资源替换json文件夹删除路径
	revDest = project_base_output_local+'rev/';  //临时储存资源替换json文件路径

//图片合成
gulp.task('spriteIndex',function(){
	var spriteData =  gulp.src(project_base_dev+'img/sprite/*.{png,jpg,gif}')
		.pipe(spritesmith({
			cssOpts:{
				baseUrl:'../img/'  //配置在css中引用sprite图片时的路径
			},
			imgName:'sprite.png',  //配置生成sprite图片的名字
			cssName:'sprite.scss',  //配置生成相应scss文件的名字
			cssFormat:'scss',  //生成格式这里是scss
			padding: 5,  //每张图片之间的间隔，这里设置为5
			cssTemplate: project_base_dev+'css/tools/scss.template.mustache'  //模板语法，详情参考最下方demo链接
		}));
	spriteData.img.pipe(gulp.dest(project_base_dev+'img/'));  //最终生成sprite图片路径
	spriteData.css.pipe(gulp.dest(project_base_dev+'css/tools/'));  //最终生成scss文件路径，建议单独存放作为工具scss类
});
//scss文件转css
gulp.task('scssOpt' ,function(){
	return gulp.src(scssSrc)
		.pipe(sourcemaps.init())  //生成map文件时使用，与下方sourcemaps.write()对应
		.pipe(scsslint({
			'config': './gulp-config/scsslint.yml'  //该文件是scss文件代码规范的制定文件，可详见于最下方demo链接
		}))
		.pipe(sass({
			outputStyle:'expanded'  //编译代码风格，常用expended（无缩进风格）和compressed（经过压缩）
		}).on('error', sass.logError))
		.pipe(autoprefixer({  //代码兼容补全，可根据项目需求自行调整兼容浏览器版本号
			browsers:[
				'Android 2.3',
				'Android >= 4',
				'Chrome >= 20',
				'Firefox >= 24',
				'Explorer >= 8',
				'iOS >= 6',
				'Opera >= 12',
				'Safari >= 6'
			],
			cascade: true,
			remove: true
		}))
		.pipe(makeUrlVer())  //css文件资源增加MD5强制清除缓存
		.pipe(sourcemaps.write())  //生成map文件
		.pipe(gulp.dest(scssDest));
});
//css压缩
gulp.task('cssMin',function () {
	return gulp.src(cssMinSrc)
		.pipe(cleanCSS({  //css压缩
			advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
			compatibility: 'ie8',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
			keepBreaks: false,//类型：Boolean 默认：false [是否保留换行]
			keepSpecialComments: '*'//保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
		}))
		.pipe(rev())
		.pipe(gulp.dest(cssDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'css/cssMin/'))
});
//css合并
gulp.task('cssCon',function () {
	return gulp.src(cssConSrc)
		.pipe(concat(cssConName))  //合并css文件且修改名称
		.pipe(rev())
		.pipe(gulp.dest(cssDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'css/cssCon/'))
});
//css清理
gulp.task('cssDel' ,function(){
	return del(cssDest,{force:true});  //force在这里的意义在于如果要操作的文件在当前目录之外需要开启force
});
//JS压缩
gulp.task('jsMin',function(){
	return gulp.src(jsMinSrc)
		.pipe(uglify({
			mangle: true,//类型：Boolean 默认：true 是否修改变量名
			compress: true,//类型：Boolean 默认：true 是否完全压缩
			//preserveComments: 'all' //保留所有注释
		}))
		.pipe(rev())
		.pipe(gulp.dest(jsDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'js/jsMin/'))
});
//JS合并
gulp.task('jsCon',function(){
	return gulp.src(jsConSrc)
		.pipe(concat(jsConName))  //合并js文件且修改名称
		.pipe(rev())
		.pipe(gulp.dest(jsDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'js/jsConFra/'))
});
//JS清理
gulp.task('jsDel',function(){
	return del(jsDest,{force:true})
});
//字体资源
gulp.task('fontsOpt',function(){
	return gulp.src(fontsSrc)
		.pipe(gulp.dest(fontsDest))
});
//压缩页面
gulp.task('htmlmin',function(){
	return gulp.src([revDest+'**/*.json',htmlSrc],{base:'./src/view/'})
		.pipe(useref({noAssets:true}))  //替换html中需要合并文件的路径和名称，需要html文件中加特殊注释，详情见下方demo链接  noAssets参数意为不需要按照注释寻找路径
		.pipe(revCollector({
			replaceReved: true  //按照rev中的资源替换json替换html中资源名称
		}))
		//这里可以定义相应的CDN加速链接
		//.pipe(replace('../css/','http://cdn......'))
		.pipe(minifyHtml({
			removeComments: true,//清除HTML注释
			collapseWhitespace: true,//压缩HTML
			collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
			removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
			removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
			removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
			minifyJS: true,//压缩页面JS
			minifyCSS: true,//压缩页面CSS
			ignoreCustomFragments:[ /<%[\s\S]*?%>/, /<\?[\s\S]*?\?>/ ]
		}))
		.on('error', function(err){
			console.log(err.message);
			this.end();
		})
		.pipe(gulp.dest(htmlDest));
});
//页面删除
gulp.task('htmlDel',function(){
	return del(htmlDest,{force:true})
});
//图片压缩
gulp.task('imagemin',function(){
	gulp.src(imgSrc)
		.pipe(imagemin())  //图片压缩
		.pipe(gulp.dest(imgDest));
});
//替换资源缓存文件删除
gulp.task('revDel', function() {
	return del(revDelSrc,{force:true})
});
//CSS操作
gulp.task('cssOpt', function(callback) {
	runSequence('cssDel','scssOpt','cssMin','cssCon',callback);
});
//JS操作
gulp.task('jsOpt', function(callback) {
	runSequence('jsDel','jsMin','jsCon',callback);
});
//初始化清除
gulp.task('clean', function() {
	return del([cssDest,jsDest,imgDest,revDest,fontsDest,htmlDest],{force:true});
});
//动态刷新页面
gulp.task('browser-sync', function() {
	browserSync.init({
		proxy: "http://localhost/"
	});
	gulp.watch(scssSrc).on('change',browserSync.reload);
});
gulp.task('dev', function() {
	gulp.watch(scssSrc,['scssOpt']);
});
gulp.task('build', function(callback) {
	runSequence(
		'clean',
		'imagemin',
		['cssOpt','jsOpt','htmlDel'],
		'htmlmin',
		'fontsOpt',
		'revDel',
		callback);
});
