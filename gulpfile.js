var gulp = require('gulp'),
	sass = require('gulp-sass'),
	sassGlob = require('gulp-sass-glob'),
	prefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps'),
	cssmin = require('gulp-clean-css'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	rimraf = require('rimraf'),
	watch = require('gulp-watch'),
	browserSync = require('browser-sync'),
	rigger = require('gulp-rigger');
	

var path = {
    dist: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'app/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'app/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'app/sass/main.sass',
        img: 'app/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'app/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        style: 'app/sass/**/*.sass',
        img: 'app/img/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean: './app'
};	
	
var config = {
    server: {
        baseDir: "./dist"
    },
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};
	
gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.dist.html)) //Выплюнем их в папку dist
        .pipe(browserSync.reload({stream: true})); //И перезагрузим наш сервер для обновлений
});	

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.dist.js)) //Выплюнем готовый файл в dist
        .pipe(browserSync.reload({stream: true})); //И перезагрузим сервер
});



gulp.task('style:build', () => {
    return setTimeout(() => {
        return gulp.src(path.src.style) //Выберем наш main.sass
        .pipe(sourcemaps.init()) //То же самое что и с js
		.pipe(sassGlob())
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.dist.css)) //И в dist
        .pipe(browserSync.reload({stream: true}));
    }, 500)
})



gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dist.img)) //И бросим в dist
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});



gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('browser-sync', function(){
	browserSync({
		server: {
			baseDir: "dist"
		},
		notify: false
	});
});

gulp.task('default', ['build', 'webserver', 'watch']);
