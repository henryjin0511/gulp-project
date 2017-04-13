require('events').EventEmitter.prototype._maxListeners = 100;
var gulp = require('gulp'),
	runSequence = require('run-sequence'),     //按顺序处理任务
	browserSync = require('browser-sync').create(),		//浏览器自动刷新
	sass = require('gulp-sass'),	//scss文件压缩
	scsslint  = require('gulp-scss-lint'),		//css兼容补全
	autoprefixer  = require('gulp-autoprefixer'),		//css兼容补全
	cleanCSS = require('gulp-clean-css'),		//css压缩
	uglify = require('gulp-uglify'),	//js压缩
	concat = require('gulp-concat'),	//js合并
	sourcemaps = require('gulp-sourcemaps'),	//scss map文件生成
	spritesmith = require('gulp.spritesmith'),	//图片sprite
	rev = require('gulp-rev'),  //自动添加版本号
	del = require('del'),	//删除文件
	useref = require('gulp-useref'),    //资源合并路径替换
	revCollector = require('gulp-rev-collector'),   //自动更换页面内版本号
	makeUrlVer = require('gulp-make-css-url-version'),
	replace = require('gulp-replace'),   //资源替换
	imagemin = require('gulp-imagemin'),    //图片压缩
	minifyHtml = require('gulp-htmlmin');	//html压缩

var static_framwork__path = '../static/lib/framework/',
	static_js_path = '../static/lib/js/',
	project_base_dev = 'public/assets_dev/',
	project_base_output_local = 'public/assets/',
	project_base_output_host = '../static/zkbjw/',
	htmlSrc = 'application/views/default_dev/**/*.php',
	htmlDest = 'application/views/default/',
	imgSrc = project_base_dev+'img/**/*.*',
	imgDest = project_base_output_local + 'img/',
	scssSrc = project_base_dev+'css/*.scss',
	scssDest = project_base_dev + 'css/',
	cssMinSrc = project_base_dev+'css/*.css',
	cssConIndexSrc = [project_base_output_local+'css/{main-*,index-*}.css','!'+project_base_output_local+'css/*-wap-*.css'],
	cssConBackSrc = project_base_output_local+'css/{main-*,back-*}.css',
	cssConMallSrc = [project_base_output_local+'css/{main-*,mall-*}.css','!'+project_base_output_local+'css/*-wap-*.css'],
	cssDest = project_base_output_local+'css/',
	jsMinSrc = project_base_dev+'js/*.js',
	jsConFraSrc = [static_js_path+'jquery/1.12.4/jquery.min.js',static_js_path+'layer/2.4/layer.js'],
	jsConBackSrc = [project_base_output_local+'js/common-*.js',project_base_output_local+'js/back-*.js'],
	jsConMallSrc = [project_base_output_local+'js/common-*.js',project_base_output_local+'js/mall-*.js','!'+project_base_output_local+'js/mall-wap-*.js'],
	jsDest = project_base_output_local+'js/',
	revDest = project_base_output_local+'rev/',
	revDel = project_base_output_local+'rev',
	fontsSrc = project_base_dev + 'fonts/**/*.*',
	fontsDest = project_base_output_local+'fonts/';

//公共主页帮主中心404等sprite图合成
gulp.task('spriteIndex',function(){
	var spriteData =  gulp.src(project_base_dev+'img/index/sprite/index/*.{png,jpg,gif}')
		.pipe(spritesmith({
			cssOpts:'../img/index/sprite/',
			imgName:'index-index.png',
			cssName:'index-index.scss',
			cssFormat:'scss',
			padding: 5,
			cssTemplate: 'public/assets_dev/css/tools/scss.template.mustache'
		}));
	spriteData.img.pipe(gulp.dest(project_base_dev+'img/index/sprite/'));
	spriteData.css.pipe(gulp.dest(project_base_dev+'css/tools/'));
});
//公共主页帮主中心404等sprite图合成WAP端 注:百分比
gulp.task('spriteIndexWap',function(){
	var spriteData =  gulp.src(project_base_dev+'img/indexWap/sprite/index/*.{png,jpg,gif}')
		.pipe(spritesmith({
			cssOpts:'../img/indexWap/sprite/',
			imgName:'index-wap-index.png',
			cssName:'index-wap-index.scss',
			cssFormat:'scss',
			padding: 5,
			cssTemplate: 'public/assets_dev/css/tools/wap.scss.template.mustache'
		}));
	spriteData.img.pipe(gulp.dest(project_base_dev+'img/indexWap/sprite/'));
	spriteData.css.pipe(gulp.dest(project_base_dev+'css/tools/'));
});
//后台sprite图合成
gulp.task('spriteBack',function(){
	var spriteData =  gulp.src(project_base_dev+'img/back/sprite/index/*.{png,jpg,gif}')
		.pipe(spritesmith({
			cssOpts:'../img/back/sprite/',
			imgName:'back-index.png',
			cssName:'back-index.scss',
			cssFormat:'scss',
			padding: 5,
			cssTemplate: 'public/assets_dev/css/tools/scss.template.mustache'
		}));
	spriteData.img.pipe(gulp.dest(project_base_dev+'img/back/sprite/'));
	spriteData.css.pipe(gulp.dest(project_base_dev+'css/tools/'));
});
//商城sprite图合成
gulp.task('spriteMall',function(){
	var spriteData =  gulp.src(project_base_dev+'img/mall/sprite/index/*.{png,jpg,gif}')
		.pipe(spritesmith({
			cssOpts:'../img/mall/sprite/',
			imgName:'mall-index.png',
			cssName:'mall-index.scss',
			cssFormat:'scss',
			padding: 5,
			cssTemplate: project_base_dev+'css/tools/scss.template.mustache'
		}));
	spriteData.img.pipe(gulp.dest(project_base_dev+'img/mall/sprite/'));
	spriteData.css.pipe(gulp.dest(project_base_dev+'css/tools/'));
});
//商城移动端sprite图合成 注:百分比
gulp.task('spriteMallWap',function(){
	var spriteData =  gulp.src(project_base_dev+'img/mallWap/sprite/index/*.{png,jpg,gif}')
		.pipe(spritesmith({
			cssOpts:'../img/mallWap/sprite/',
			imgName:'mall-wap-index.png',
			cssName:'mall-wap-index.scss',
			cssFormat:'scss',
			padding: 5,
			cssTemplate: project_base_dev+'css/tools/wap.scss.template.mustache'
		}));
	spriteData.img.pipe(gulp.dest(project_base_dev+'img/mallWap/sprite/'));
	spriteData.css.pipe(gulp.dest(project_base_dev+'css/tools/'));
});
//scss文件转css生成.map文件
gulp.task('scsstocss' ,function(){
	return gulp.src(scssSrc)
		.pipe(sourcemaps.init())
		/*.pipe(scsslint({
			'config': './gulpconfig/scsslint.yml',
			'maxBuffer': 2048000
		}))*/
		.pipe(sass({outputStyle:'expanded'}).on('error', sass.logError))
		.pipe(autoprefixer({
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
		.pipe(makeUrlVer())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(scssDest));
});
//css压缩
gulp.task('cssMin',function () {
	return gulp.src(cssMinSrc)
		.pipe(cleanCSS({
			advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
			compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
			keepBreaks: false,//类型：Boolean 默认：false [是否保留换行]
			keepSpecialComments: '*'//保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
		}))
		.pipe(rev())
		.pipe(gulp.dest(cssDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'css/cssMin/'))
});
//css公共主页合并
gulp.task('cssConIndex',function () {
	return gulp.src(cssConIndexSrc)
		.pipe(concat('bfq-index.css'))
		.pipe(rev())
		.pipe(gulp.dest(cssDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'css/cssCon/index/'))
});
//css后台合并
gulp.task('cssConBack',function () {
	return gulp.src(cssConBackSrc)
		.pipe(concat('bfq-back.css'))
		.pipe(rev())
		.pipe(gulp.dest(cssDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'css/cssCon/back/'))
});
//css商城合并
gulp.task('cssConMall',function () {
	return gulp.src(cssConMallSrc)
		.pipe(concat('bfq-mall.css'))
		.pipe(rev())
		.pipe(gulp.dest(cssDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'css/cssCon/mall/'))
});
//css清理
gulp.task('cssDel' ,function(){
	return del(cssDest,{force:true});
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
//JS依赖合并
gulp.task('jsConFra',function(){
	return gulp.src(jsConFraSrc)
		.pipe(concat('bfq-rely.js'))
		.pipe(rev())
		.pipe(gulp.dest(jsDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'js/jsConFra/'))
});
//JS书写合并
gulp.task('jsConBack',function(){
	return gulp.src(jsConBackSrc)
		.pipe(concat('bfq-back.js'))
		.pipe(rev())
		.pipe(gulp.dest(jsDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'js/jsCon/back/'))
});
//JS商城合并
gulp.task('jsConMall',function(){
	return gulp.src(jsConMallSrc)
		.pipe(concat('bfq-mall.js'))
		.pipe(rev())
		.pipe(gulp.dest(jsDest))
		.pipe(rev.manifest())
		.pipe(gulp.dest(revDest+'js/jsCon/mall/'))
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
	return gulp.src([revDest+'**/*.json',htmlSrc],{base:'application/views/default_dev/'})
		.pipe(useref({noAssets:true}))
		.pipe(revCollector({
			replaceReved: true
		}))
		//需要CDN加速时开放
		//.pipe(replace('http://res.zuanbank.com/static/','http://qiniu.zuanbank.com/static/zkbjw/'))
		//.pipe(replace('/public/assets_dev/','http://res.zuanbank.com/static/zkbjw/'))
		//采用zuanbank资源库开放
		.pipe(replace('public/assets_dev/','public/assets/'))
		//.pipe(replace('/public/assets_dev/','http://res.zuanbank.com/static/zkbjw/'))
		.pipe(minifyHtml({
			removeComments: true,//清除HTML注释
			//collapseWhitespace: true,//压缩HTML
			collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
			removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
			removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
			removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
			//minifyJS: true,//压缩页面JS
			//minifyCSS: true,//压缩页面CSS
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
		.pipe(imagemin())
		.pipe(gulp.dest(imgDest));
});
//替换资源缓存文件删除
gulp.task('revDel', function(callback) {
	return del(revDel,{force:true})
});
//CSS操作
gulp.task('cssOpt', function(callback) {
	runSequence('cssDel','scsstocss','cssMin','cssConIndex','cssConBack','cssConMall',callback);
});
//JS操作
gulp.task('jsOpt', function(callback) {
	runSequence('jsDel','jsMin','jsConFra','jsConBack','jsConMall',callback);
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
gulp.task('dev', function(callback) {
	gulp.watch(scssSrc,['scsstocss']);
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
