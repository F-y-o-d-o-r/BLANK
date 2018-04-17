//1. Node.js
//2. npm install --global gulp - Для начала мы должны установить Gulp глобально, чтобы наш компьютер был в курсе о его наличии.
//3. npm init - package.json - Поскольку Gulp является пакетом Node.js мы должны настроить пакеты Node через файл настроек с именем package.json. Этот файл говорит Node, какие пакеты требуются в нашем проекте.Вы также можете создать файл, выполнив npm init и сказав yes для всех шагов.
//3.1 Нужно в консоли перейти в папку с файлом package.json и прописать ------------------- npm install -------------------------
//4. Если нужен дополнительный пакет: npm install --save-dev plugin-name - Затем запустите следующую команду, чтобы npm установил копию Gulp в текущем проекте в качестве необходимого пакета.
//5. touch gulpfile.js - создание

//!!! npm outdated - проверит актуальные версии плагинов   !!! потом можно npm update

//DIFF INFO
//Существует плагин gulp-load-plugins который позволяет не писать всю эту лапшу из require.
//bower пакеты можно подключать через такой плагин как gulp-bower
//обновление установелнных пакетов в package.json плагин - npm i -g npm-check-updates, потом команда ncu - покажет, ncu -u и по новой установить - обновит
//https://webref.ru/dev/automate-with-gulp
//browser-sync start --server --files "css/**/*.css,js/**/*.js,html/**/*.html,*.*"
/******************************************************************************/
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
    pug = require('gulp-pug'),
    sassGlob = require('gulp-sass-glob'), //@import "vars/**/*.scss";    - dir import in sass
    svgSprite = require('gulp-svg-sprites'), //svg - 1 - svg>use xlink:href="#id" (после загрузки инлайново на страницу с дисплей нан). 2 - svg>use xlink:href='/adress/img.svg#id'
    filter = require('gulp-filter'),
    reload = browserSync.reload;
/******************************************************************************/
var path = {
    build: {//Тут мы укажем куда складывать готовые после сборки файлы
        html: 'prod',
        js: 'prod/js',
        style: 'prod/css',
        libsstyle: 'source/libs/concat_from_node_modules',
        img: 'prod/img',
        fonts: 'prod/fonts',
        spritesimg: 'source/img/sprites/',
        spritesstyles: 'source/sprites/other/styles/',
        spritesSvg: 'source/img/sprites/',
        spritesSvgStyles: 'source/libs/svgStyles/',
    },
    source: { //Пути откуда брать исходники
        //html: ['source/*.html'], //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        pug: ['source/blocks/*.pug'], //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .pug
        js: ['source/js/main.js'], //В стилях и скриптах нам понадобятся только main файлы
        lib: [
            'source/libs/**/*.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js', //bootstrap 4
            'node_modules/popper.js/dist/umd/popper.min.js', //popper for bootstrap
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/owl.carousel/dist/owl.carousel.min.js',
            'node_modules/scrollmagic/scrollmagic/minified/ScrollMagic.min.js',
            'node_modules/scrollmagic/scrollmagic/minified/plugins/debug.addIndicators.min.js',
            'node_modules/slick-carousel/slick/slick.min.js',
            'node_modules/lightslider/dist/js/lightslider.min.js',
            'node_modules/gsap/src/minified/TweenMax.min.js',
            'node_modules/wowjs/dist/wow.min.js',
        ], //jquery & libraries
        style: ['source/sass/main.sass'],
        libsstyles: [
            'source/libs/**/*.css',
            'node_modules/animate.css/animate.min.css',
            'node_modules/normalize.css/normalize.css',
            'node_modules/owl.carousel/dist/assets/owl.carousel.min.css',
            'node_modules/owl.carousel/dist/assets/owl.theme.default.min.css',
            'node_modules/node_modules/slick-carousel/slick/slick.css',
            'node_modules/lightslider/dist/css/lightslider.min.css',
        ],//стили библиотек
        libssassstyles: [
            'node_modules/bootstrap/scss/bootstrap.scss',
            'node_modules/bootstrap/scss/bootstrap-grid.scss',
            'node_modules/bootstrap/scss/bootstrap-reboot.scss',
        ],//sass библиотек
        img: 'source/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'source/fonts/**/*.*',
        sprites: 'source/sprites/other/*.*',
        spritesSvg: 'source/sprites/svg/*.*',
        htacces: 'source/.htacces'
        // [
        // 'app/libs/jquery/dist/jquery.min.js',
        //   'app/js/common.min.js', // Всегда в конце
        // ]
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        //html: 'source/**/*.html',
        pug: [
            'source/blocks/**/*.pug',
            'source/standart_blocks/**/*.pug'
        ],
        js: [
            'source/blocks/**/*.js',
            'source/js/main.js',
            'source/standart_blocks/**/*.js'
        ],
        style: [
            'source/blocks/**/*.scss',
            'source/blocks/**/*.sass',
            'source/sass/main.sass', 'source/standart_blocks/**/*.scss',
            'source/sass/**/*.scss',
            'source/sass/**/*.sass'
        ],
        img: 'source/img/**/*.*',
        fonts: 'source/fonts/**/*.*',
        lib: 'source/libs/**/*.js' //jquery & libraries
    },
    dell: {
        prod: [
            'prod',
            'source/sprites/other/styles',
            'source/libs/svgStyles',
            'source/img/sprites']
    }
};
//Создадим переменную с настройками нашего dev сервера:
var config = {
    server: {
        baseDir: "./prod" // Директория для сервера
    },
    //tunnel: true,
    //tunnel: "fyodor", //Demonstration page: https://fyodor.localtunnel.me //http://myprogect.localtunnel.me//https://localtunnel.github.io/www/
    host: 'localhost',
    port: 63341, //9000,//8080
    logPrefix: "Frontend",
    notify: false, // Отключаем уведомления
    open: false,
};
/******************************************************************************/
//собираем html - перешел на pug
//gulp.task('html', function () {
//  gulp.src(path.source.html) //Выберем файлы по нужному пути
//    .pipe(rigger()) //добавляем присоеденённое по ссылкам
//    //.pipe(sourcemaps.init())
//    .pipe(htmlmin({collapseWhitespace: true}))
//    //.pipe(sourcemaps.write())
//    .pipe(duration('html'))
//    .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
//    .pipe(reload({
//      stream: true
//    })); //И перезагрузим наш сервер для обновлений
//});
/******************************************************************************/
// собираем html - PUG
gulp.task('pug', function () {
    gulp.src(path.source.pug)
        .pipe(pug({
            pretty: false //min
        }))
        .pipe(duration('pug'))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({
            stream: true
        }));
});
/******************************************************************************/
//Собираем стили
gulp.task('style', function () {
    gulp.src(path.source.style) //Выберем наш main.scss
    //.pipe(sourcemaps.init())
        .pipe(sassGlob()) //@import "vars/**/*.scss";   - dir import in sass
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
//переносим библиотеки - sass в один файл css
gulp.task('lib-sass', function () {
    gulp.src(path.source.libssassstyles) //Выберем наши стили библиотек
    //.pipe(sourcemaps.init())
        .pipe(sassGlob()) //@import "vars/**/*.scss";   - dir import in sass
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoPrefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
            cascade: true
        })) //Добавим вендорные префиксы
        //.pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(duration('css'))
        .pipe(gulp.dest(path.build.libsstyle)) //
        .pipe(reload({
            stream: true
        }));
});
//переносим библиотеки - css в один файл - переношу в css
gulp.task('lib-css', /*['lib-sass'],*/ function () {
    gulp.src(path.source.libsstyles) //Найдем наши файлы
        .pipe(concat('libs.min.css'))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)) //min
        .pipe(gulp.dest(path.build.style)) //Выплюнем готовый файл в build
        .pipe(duration('lib-css'))
        .pipe(reload({
            stream: true
        })); //И перезагрузим сервер
});
//переносим библиотеки - js
gulp.task('lib', function () {
    gulp.src(path.source.lib) //Найдем наш файл
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(duration('lib'))
        .pipe(reload({
            stream: true
        })); //И перезагрузим сервер
});
/******************************************************************************/
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
/******************************************************************************/
//Таск по картинкам
gulp.task('image', /*['sprite'],*/ function () {
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
/******************************************************************************/
//Таск по спрайтам
gulp.task('sprite', function () {
    var spriteData = gulp.src(path.source.sprites)
        .pipe(spritesmith({
            imgName: 'sprite.png',
            //cssName: 'sprite.sass',
            cssName: 'sprite.css'
        }));
    //return spriteData.pipe(gulp.dest('source/img/sprites/'));
    spriteData.img.pipe(gulp.dest(path.build.spritesimg)); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest(path.build.spritesstyles)); // путь, куда сохраняем стили
});
//Таск по svg спрайтам
gulp.task('spriteSvg', function () {
    return gulp.src(path.source.spritesSvg)
        .pipe(svgSprite({
            //shape: {     // Set maximum dimensions
                //dimension: {
                    //maxWidth: 500,
                    //maxHeight: 500
                //},
                //spacing: {         // Add padding
                    //padding: 0
                //}
            //},
            mode: "symbols",
        }))
        //.pipe(gulp.dest(path.build.spritesSvgStyles))
        .pipe(filter("**/*.svg"))  // Filter out everything except the SVG file
        .pipe(gulp.dest(path.build.spritesSvg))
});
/******************************************************************************/
//Шрифты просто копируем
gulp.task('fonts', function () {
    gulp.src(path.source.fonts)
        .pipe(gulp.dest(path.build.fonts))
});
/******************************************************************************/
//.htacces просто копируем
gulp.task('htacces', function () {
    gulp.src(path.source.htacces)
        .pipe(gulp.dest('prod/'))
});
/******************************************************************************/
//удалим папку prod
gulp.task('del', function () {
    return del.sync(path.dell.prod);
});
/******************************************************************************/
//таск с именем «build», который будет запускать все
gulp.task('build', [
    //'html',
    'pug',
    'js',
    'lib',
    'lib-sass',
    'lib-css',
    'style',
    'fonts',
    'htacces',
    'sprite',
    'spriteSvg',
    'image'
]);
//таск с именем «work», который будет запускать то что нужно во время работы
gulp.task('work', [
    //'html',
    'pug',
    'js',
    'style'
]);
/******************************************************************************/
//Изменения файлов все
gulp.task('watch', function () {
    //watch([path.watch.html, 'source/blocks/**/*.html'], function (event, cb) {
    //  gulp.start('html');
    //});
    watch(path.watch.pug, function (event, cb) {
        gulp.start('pug');
    });
    watch(path.watch.style, function (event, cb) {
        gulp.start('style');
    });
    watch(path.watch.js, function (event, cb) {
        gulp.start('js');
    });
    watch([path.watch.lib], function (event, cb) {
        gulp.start('lib');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image');
    });
    /*watch('source/sprites/!*.*', function (event, cb) {
        gulp.start('sprite');
    });*/
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts');
    });
});
//Изменения файлов для work
gulp.task('watch_work', function () {
    //watch([path.watch.html, 'source/blocks/**/*.*'], function (event, cb) {
    //  gulp.start('html');
    //});
    watch(path.watch.pug, function (event, cb) {
        gulp.start('pug');
    });
    watch(path.watch.style, function (event, cb) {
        gulp.start('style');
    });
    watch(path.watch.js, function (event, cb) {
        gulp.start('js');
    });
});
/******************************************************************************/
//Веб сервер// запустим livereload сервер с настройками, которые мы определили в объекте config
gulp.task('webserver', function () {
    browserSync(config);
});
/******************************************************************************/
gulp.task('default', ['build', 'webserver', 'watch']);
gulp.task('one', ['work', 'webserver', 'watch_work']);