let gulp = require('gulp');
let rollup = require('rollup').rollup;
let nodeResolve = require('rollup-plugin-node-resolve');
let commonjs = require('rollup-plugin-commonjs');
let uglify = require('rollup-plugin-uglify');
let sass = require('gulp-sass');
let concat = require('gulp-concat');
let rev = require('gulp-rev');
let inject = require('gulp-inject');
let exec = require('child_process').exec;
let argv = require('yargs').argv;
let del = require('del');

let prodMode = argv.prod;

//Build TODOs
//global Sass
//vendor css
//vendor JS. e.g. moment
//cache bust js and css
//css source maps
//js source maps
//clean dist on build
//Live reload

function styles() {
    let sassOptions = {outputStyle: prodMode ? 'compressed' : 'nested'};

    return gulp.src('src/**/*.scss')
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(gulp.dest('src'));
}

function ngc() {
    return exec('"node_modules/.bin/ngc" -p "tsconfig.json"');
}

let rollUpBundle;
function rollupApp() {
    let devPlugins = [
        nodeResolve({jsnext: true, module: true}),
        commonjs({include: 'node_modules/rxjs/**'})
    ];

    let prodPlugins = [...devPlugins, uglify()];

    let rollupConfig = {
        entry: 'src/main.js',
        cache: rollUpBundle,
        plugins: prodMode ? prodPlugins : devPlugins,
        onwarn: function (msg) {
            if (!msg.includes("The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten")) {
                console.error(msg);
            }
        }
    };

    return rollup(rollupConfig)
        .then((bundle) => {
            rollUpBundle = bundle;

            return bundle.write({
                format: 'iife',
                dest: `dist/app-${Date.now().toString(36)}.js`
            });
        });
}

function globalJs() {
    return gulp.src([
        'node_modules/core-js/client/shim.min.js',
        'node_modules/zone.js/dist/zone.min.js'
    ])
        .pipe(concat('global.js'))
        .pipe(rev())
        .pipe(gulp.dest('dist'));
}

function index() {
    let srcStream = gulp.src(['dist/global*.js', 'dist/app*.js'], {read: false});

    return gulp.src('src/index.html')
        .pipe(inject(srcStream, {addRootSlash: false, ignorePath: 'dist'}))
        .pipe(gulp.dest('dist'));
}

gulp.task(styles);
gulp.task(ngc);
gulp.task('rollupApp', gulp.series(() => del('dist/app-*.js'), rollupApp));
gulp.task('globalJs', gulp.series(() => del('dist/global-*.js'), globalJs));
//TODO: encapsulate the clean and rollup in an function so we don't need to call it as a string
let appJs = gulp.series(styles, ngc, 'rollupApp');
gulp.task(index);

gulp.task('default', gulp.series(gulp.parallel(appJs, globalJs), index, function watch() {
    gulp.watch('src/**/*.ts', appJs);
    gulp.watch('src/**/*.scss', styles);
}));