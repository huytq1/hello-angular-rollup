let gulp = require('gulp');
let rollup = require('rollup').rollup;
let nodeResolve = require('rollup-plugin-node-resolve');
let commonjs = require('rollup-plugin-commonjs');
let uglify = require('rollup-plugin-uglify');
let sass = require('gulp-sass');
let exec = require('child_process').exec;

//Build TODOs
//minify js in prod
//minify sass in prod
//global Sass
//vendor css
//vendor JS. e.g. moment
//cache bust js and css
//move everything to dist. e.g. index
//css source maps
//js source maps
//clean css on build
//clean aot on build
//clean dist on build
//Live reload

function styles() {
    return gulp.src('src/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('src'));
}

function ngc() {
    return exec('"node_modules/.bin/ngc" -p "tsconfig.json"');
}

let rollUpBundle;
function rollupApp() {
    let rollupConfig = {
        entry: 'src/main.js',
        cache: rollUpBundle,
        plugins: [
            nodeResolve({jsnext: true, module: true}),
            commonjs({
                include: 'node_modules/rxjs/**',
            })
            //Only uglify in prod as it adds time
            /*,
             uglify()*/
        ],
        onwarn: function (msg) {
            if(!msg.includes("The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten")) {
                console.error(msg);
            }
        }
    };

    return rollup(rollupConfig)
        .then((bundle) => {
            rollUpBundle = bundle;
            return bundle.write({
                format: 'iife',
                dest: 'dist/app.js'
            });
        });
}

let js = gulp.series(styles, ngc, rollupApp);

gulp.task(styles);
gulp.task(ngc);
gulp.task(rollupApp);

gulp.task('default',  gulp.series(js, function watch() {
    gulp.watch('src/**/*.ts', js);
    gulp.watch('src/**/*.scss', styles);
}));