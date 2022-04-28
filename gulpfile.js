const {src, dest, task, series, watch, parallel} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const gulpif = require('gulp-if');
sass.compiler = require('node-sass');
const reload = browserSync.reload;
const rm = require("gulp-rm");
const env = process.env.NODE_ENV;

task("clean", () => {
    return src('./dist/**/*', {read: false}).pipe(rm());
});

task("copy:images", () => {
    return src('src/images/**/*')
        .pipe(dest('dist/images'))
});

task("copy:fonts", () => {
    return src('src/fonts/**/*')
        .pipe(dest('dist/fonts'))
});
task('copy:html', () => {
    return src('src/index.html')
        .pipe(dest('dist'))
});

const libs = [
    'node_modules/jquery/dist/jquery.js',
    'src/js/mobile-detect.js',
    'src/js/jquery.touchSwipe.js',
    'src/js/main.js'
];
task('scripts', () => {
    return src(libs)
        .pipe(concat("main.js"))
        .pipe(
            gulpif(
                env === "prod",
                babel({
                    presets: ["@babel/env"]
                })
            )
        )
        .pipe(gulpif(env === "prod", uglify()))
        .pipe(dest('dist'))
});
task('styles', () => {
    return src('src/scss/main.scss')
        .pipe(sass().on("error", sass.logError))
        .pipe(gulpif(env === "prod", gcmq()))
        .pipe(gulpif(env === "prod", cleanCSS()))
        .pipe(gulpif(env === "prod", autoprefixer()))
        .pipe(concat('main.css'))
        .pipe(dest('dist'))
});

task("server", () => {
        browserSync.init({
            server: {
                baseDir: `./dist`
            },
        });
});
task("watch", () => {
        watch('src/images/**', series("copy:images")).on("change", reload);
        watch('src/fonts/**', series("copy:fonts")).on("change", reload);
        watch('src/js/**/*.js', series("scripts")).on("change", reload);
        watch('src/index.html', series("copy:html")).on("change", reload);
        watch('src/scss/**/*.scss', series("styles")).on("change", reload);
});
task(
    "default",
    series(
        "clean",
        parallel("copy:images", "copy:fonts", "copy:html", "styles", "scripts"),
        parallel("watch", "server")
    )
);
