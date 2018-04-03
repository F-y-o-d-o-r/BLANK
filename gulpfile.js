//1. Node.js
//2. npm install --global gulp - Для начала мы должны установить Gulp глобально, чтобы наш компьютер был в курсе о его наличии.
//3. npm init - package.json - Поскольку Gulp является пакетом Node.js мы должны настроить пакеты Node через файл настроек с именем package.json. Этот файл говорит Node, какие пакеты требуются в нашем проекте.Вы также можете создать файл, выполнив npm init и сказав yes для всех шагов.
//3.1 Нужно в консоли перейти в папку с файлом package.json и прописать ------------------- npm install -------------------------
//4. Если нужен дополнительный пакет: npm install --save-dev gulp - Затем запустите следующую команду, чтобы npm установил копию Gulp в текущем проекте в качестве необходимого пакета.
//5. touch gulpfile.js - создание

//DIFF INFO
//Существует плагин gulp-load-plugins который позволяет не писать всю эту лапшу из require.
//bower пакеты можно подключать через такой плагин как gulp-bower
//обновление установелнных пакетов в package.json плагин - npm i -g npm-check-updates, потом команда ncu - покажет, ncu -u и по новой установить - обновит
//https://webref.ru/dev/automate-with-gulp
//browser-sync start --server --files "css/**/*.css,js/**/*.js,html/**/*.html,*.*"

var gulp = require('gulp'),// Подключаем Gulp
  autoPrefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
  //cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS //сжимаем в другом..
  watch = require('gulp-watch'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),//Подключаем Sass пакет //_part.sass не войдет, толко через @import 'part' в другом файле sass
  htmlmin = require('gulp-htmlmin'),
  browserSync = require('browser-sync'),// Подключаем Browser Sync
  imageMin = require('gulp-imagemin'),// Подключаем библиотеку для работы с изображениями
  pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
  uglify = require('gulp-uglify'), // Подключаем gulp-uglify (для сжатия JS)
  autopolyfiller = require('gulp-autopolyfiller'),
  concat = require('gulp-concat'),//for autopolifiller // Подключаем gulp-concat (для конкатенации файлов)
  order = require("gulp-order"),//for autopolifiller
  merge = require('event-stream').merge,//for autopolifiller
  rigger = require('gulp-rigger'), //Плагин позволяет импортировать один файл в другой простой конструкцией //= footer.html + есть gulp-x-includer  - <!-- include "./partials/_header.html" -->+ Gulp-useref - https://webformyself.com/gulp-dlya-nachinayushhix/
  //includer = require('gulp-x-includer'), //Плагин позволяет импортировать один файл в другой простой конструкцией <!-- include "path/to/xxx.html" -->
  //uncss = require('uncss'),//удалит не используемый css
  duration = require("gulp-duration"),//время выполнения таска
  //gzip = require("gulp-gzip"),//сжатие файла
  //cssConcat = require('gulp-concat-css'), //соединяем css файлы + @import "partials/app";
  del = require('del'), //удалит папку или файл;
  //resolver = require("gulp-resolver"), //переписывает пути ссылок если надо
  //debug = require('gulp-debug'), //показывает что происходит в pipe
  //notify = require('gulp-notify'), //покажет ошибку
  //plumber = require('gulp-plumber'), //отлавливает где ошибка
  rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов .pipe(rename({suffix: '.min', prefix : ''}))
  //cache = require('gulp-cache'), // Подключаем библиотеку кеширования
  //pug = require('pug'), // Препроцессор HTML + include...
  //Run Sequence - задачи по очереди runSequence('task-one', 'task-two', 'task-three', callback) - https://webformyself.com/gulp-dlya-nachinayushhix/
  //assets - ненужно будет прописывать пути полные к картинкам, можно раз в плагине прописать, а потом только названия + base64-encodes - встраивать в css картинку https://www.youtube.com/watch?v=1blx7Yic5qM&index=4&list=PLY4rE9dstrJwmJZgILzgN4svtdpptYwdK
  spritesmith = require('gulp.spritesmith'),//делаем спрайты
  reload = browserSync.reload;

var path = {
  build: {//Тут мы укажем куда складывать готовые после сборки файлы
    html: 'prod',
    js: 'prod/js',
    style: 'prod/css',
    img: 'prod/img',
    fonts: 'prod/fonts'
  },
  source: { //Пути откуда брать исходники
    html: ['source/*.html'], //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: ['source/js/main.js'], //В стилях и скриптах нам понадобятся только main файлы
    lib: 'source/libs/**/*.js', //jquery & libraries
    style: ['source/sass/*.scss'],
    img: 'source/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    fonts: 'source/fonts/**/*.*'
    // [
    // 'app/libs/jquery/dist/jquery.min.js',
    //   'app/js/common.min.js', // Всегда в конце
    // ]
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: 'source/**/*.html',
    js: 'source/js/**/*.js',
    style: 'source/sass/*.scss',
    img: 'source/img/**/*.*',
    fonts: 'source/fonts/**/*.*'
  }
};
//Создадим переменную с настройками нашего dev сервера:
var config = {
  server: {
    baseDir: "./prod" // Директория для сервера
  },
  //tunnel: true,
  //tunnel: "Fyodor", //Demonstration page: http://myprogect.localtunnel.me//https://localtunnel.github.io/www/
  host: 'localhost',
  port: 9000,//8080
  logPrefix: "Frontend",
  notify: false, // Отключаем уведомления
  open: false,
};
/******************************************************************************/
//собираем html
gulp.task('html', function () {
  gulp.src(path.source.html) //Выберем файлы по нужному пути
    .pipe(rigger()) //добавляем присоеденённое по ссылкам
    //.pipe(sourcemaps.init())
    .pipe(htmlmin({collapseWhitespace: true}))
    //.pipe(sourcemaps.write())
    .pipe(duration('html'))
    .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
    .pipe(reload({
      stream: true
    })); //И перезагрузим наш сервер для обновлений
});
/******************************************************************************/
//Собираем стили
gulp.task('style', function () {
  gulp.src(path.source.style) //Выберем наш main.scss
  //.pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoPrefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    })) //Добавим вендорные префиксы
    //.pipe(sourcemaps.write())
    .pipe(rename({suffix: '.min', prefix: ''}))
    .pipe(duration('css'))
    .pipe(gulp.dest(path.build.style)) //И в build
    .pipe(reload({
      stream: true
    }));
});
/******************************************************************************/
//Таск по сборке скриптов js + полифилы
//gulp.task
gulp.task('js', function () {
  // Concat all required js files
  var all = gulp.src(path.source.js)//Найдем наш main файл
    .pipe(rigger()) //добавляем присоеденённое по ссылкам
    .pipe(concat('all.js'));
  // Generate polyfills for all files
  var polyfills = all
    .pipe(autopolyfiller('polyfills.js'), {
      browsers: ['last 15 versions', '> 1%', 'ie9', 'ie 8', 'ie 7']
    });
  // Merge polyfills and all files streams
  return merge(polyfills, all)
  // Order files. NB! polyfills MUST be first
    .pipe(order([
      'polyfills.js',
      'all.js'
    ]))
    // Make single file
    .pipe(concat('main.min.js'))
    //.pipe(sourcemaps.init()) //Инициализируем sourcemap
    .pipe(uglify())// сжимаем
    //.pipe(sourcemaps.write()) //Пропишем карты
    // And finally write `all.min.js` into `build/` dir
    .pipe(duration('js'))
    .pipe(gulp.dest(path.build.js))//Выплюнем готовый файл в build
    .pipe(reload({
      stream: true
    })); //И перезагрузим сервер
});
/******************************************************************************/
//переносим jquery
gulp.task('lib', function () {
  gulp.src(path.source.lib) //Найдем наш файл
    .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
    .pipe(duration('lib'))
    .pipe(reload({
      stream: true
    })); //И перезагрузим сервер
});
//просто js
/*gulp.task('js', /!*['js:polifil'],*!/ function () {
 gulp.src(path.source.js) //Найдем наш main файл
 .pipe(concat('main.min.js'))
 .pipe(sourcemaps.init()) //Инициализируем sourcemap
 .pipe(uglify()) //Сожмем наш js
 .pipe(sourcemaps.write()) //Пропишем карты
 .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
 .pipe(reload({
 stream: true
 })); //И перезагрузим сервер
 });*/
//Таск по картинкам
gulp.task('image',/*['sprite'],*/ function () {
  gulp.src(path.source.img) //Выберем наши картинки
    .pipe(imageMin({ //Сожмем их
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(duration('img'))
    .pipe(gulp.dest(path.build.img)) //И бросим в build
    .pipe(reload({
      stream: true
    }));
});
//Таск по спрайтам
gulp.task('sprite', function () {
  var spriteData = gulp.src('source/sprites/*.*')
    .pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css',
  }));
  //return spriteData.pipe(gulp.dest('source/img/sprites/'));
  spriteData.img.pipe(gulp.dest('source/img/sprites/')); // путь, куда сохраняем картинку
  spriteData.css.pipe(gulp.dest('source/sprites/styles/')); // путь, куда сохраняем стили
});
//Шрифты просто копируем
gulp.task('fonts', function () {
  gulp.src(path.source.fonts)
    .pipe(gulp.dest(path.build.fonts))
});
//удалим папку prod
gulp.task('del', function () {
  return del.sync('prod');
});
//таск с именем «build», который будет запускать все
gulp.task('build', [
  'html',
  'js',
  'style',
  'fonts',
  'image',
  'lib'
]);
//таск с именем «work», который будет запускать то что нужно во время работы
gulp.task('work', [
  'html',
  'js',
  'style'
]);
//Изменения файлов все
gulp.task('watch', function () {
  watch([path.watch.html, 'source/blocks/**/*.html'], function (event, cb) {
    gulp.start('html');
  });
  watch([path.watch.style, 'source/blocks/**/*.scss'], function (event, cb) {
    gulp.start('style');
  });
  watch([path.watch.js, 'source/blocks/**/*.js'], function (event, cb) {
    gulp.start('js');
  });
  watch([path.watch.js], function (event, cb) {
    gulp.start('lib');
  });
  watch([path.watch.img], function (event, cb) {
    gulp.start('image');
  });
/*  watch('source/sprites/!*.*', function (event, cb) {
    gulp.start('sprite');
  });*/
  watch([path.watch.fonts], function (event, cb) {
    gulp.start('fonts');
  });
});
//Изменения файлов для work
gulp.task('watch_work', function () {
  watch([path.watch.html, 'source/blocks/**/*.*'], function (event, cb) {
    gulp.start('html');
  });
  watch([path.watch.style, 'source/blocks/**/*.scss'], function (event, cb) {
    gulp.start('style');
  });
  watch([path.watch.js, 'source/blocks/**/*.js'], function (event, cb) {
    gulp.start('js');
  });
});
//Веб сервер// запустим livereload сервер с настройками, которые мы определили в объекте config
gulp.task('webserver', function () {
  browserSync(config);
});
gulp.task('default', ['build', 'webserver', 'watch']);
gulp.task('one', ['work', 'webserver', 'watch_work']);