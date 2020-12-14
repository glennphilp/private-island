'use strict';

const plugins = require ('gulp-load-plugins');
const gulp = require('gulp');
const sass = require('gulp-sass');
const inlinesrc = require('gulp-inline-source');
const cleancss = require('gulp-clean-css');

const yargs = require('yargs');
const panini = require('panini');
const rimraf = require('rimraf');
const browser = require('browser-sync').create();

// Load all Gulp plugins into on variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

gulp.task('default', gulp.series(clean, gulp.parallel(html, style, images), server, watch));
gulp.task('build', gulp.series(clean, gulp.parallel(html, style, images), inline_src, server))

// Clean dist
function clean(done) {
  if (yargs.argv.production) {
    console.log('Cleaning Production')
    rimraf('./prd', done);
  } else {
    console.log('Cleaning Development')
    rimraf('./dev', done);
  }
}

// compile SCSS into CSS
function style() {
  // If Production
  if (yargs.argv.production) {
    console.log('Running Production Styles')
    return gulp.src('./src/assets/scss/**/*.scss')
              .pipe($.sourcemaps.init({loadMaps: true}))
              .pipe($.autoprefixer())
              .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
              .pipe(gulp.dest('./prd/_css'))
              .pipe(browser.reload({stream: true}));
  } else {
    console.log('Running Development Styles')
    return gulp.src('./src/assets/scss/**/*.scss')
              .pipe($.sourcemaps.init({loadMaps: true}))
              .pipe(sass.sync({outputStyle: 'expanded'}).on('error', sass.logError))
              .pipe($.autoprefixer())
              .pipe(cleancss({debug: true}, (details) => {
                      console.log(`${details.name}: ${details.stats.originalSize}`);
                      console.log(`${details.name}: ${details.stats.minifiedSize}`);
                  }))
              .pipe($.sourcemaps.write('./maps'))
              .pipe(gulp.dest('./dev/_css'))
              .pipe(browser.reload({stream: true}));
  }
}

// Compile Static files
function html() {
  return gulp.src('./src/pages/**/*.html')
  .pipe(panini({
    root: 'src/pages/',
    layouts: 'src/layouts/',
    pageLayouts: {
      'blog': 'blog'
    },
    partials: 'src/partials/',
    helpers: 'src/helpers/',
    data: 'src/data/'
  }))
  .pipe($.if(!PRODUCTION, gulp.dest('./dev')))
  .pipe($.if(PRODUCTION, gulp.dest('./prd')));
}

// Inline Source After Pages Render
function inline_src() {
  return gulp.src('./dev/**/*.html')
  .pipe(inlinesrc())
  .pipe($.if(!PRODUCTION, gulp.dest('./dev')))
  .pipe($.if(PRODUCTION, gulp.dest('./prd')));
}

// Compile JavaScript


// Optimizing Images
function images(done) {
  rimraf('./dev/_img', done);
  gulp.src('./src/assets/images/**/*')
  .pipe($.imagemin([
    $.imagemin.gifsicle({interlaced: true}),
    $.imagemin.mozjpeg({quality: 75, progressive: true}),
    $.imagemin.optipng({optimizationLevel: 5}),
    $.imagemin.svgo({
      plugins: [
        {removeViewBox: true},
        {cleanupIDs: false}
      ]
    })
  ]))
  .pipe($.if(!PRODUCTION, gulp.dest('./dev/_img')))
  .pipe($.if(PRODUCTION, gulp.dest('./prd/_img')));
  done();
}

function server(done) {
  browser.init({
    browser: "firefox",
    server: {
      baseDir: './dev'
    },
    port: 12484
    
    // proxy: "http://swlxprddb1edu.swmed.edu/",
    // serveStatic: [{
    //   route: ['/css', '/js'],
    //   dir: 'dist'
    // }]
  });
  done();
}

// Load updated HTML templates and partials into Panini
// function reset_pages(done) {

//   done();
// }

function reload(done) {
  panini.refresh();
  browser.reload();
  done();
}

function watch() {
  gulp.watch('./src/assets/scss/**/*.scss').on('all', style);
  gulp.watch('./src/assets/js/**/*.js').on('all', browser.reload);
  gulp.watch('./src/assets/images/**/*').on('all', gulp.series(reload, images, browser.reload));
  gulp.watch('src/{layouts,partials,data,pages}/**/*.{html, json, jsonp, txt}').on('all', gulp.series(reload, html, browser.reload));
}

exports.html = html;
exports.style = style;
exports.images = images;
exports.server = server;
exports.watch = watch;
exports.inline_src = inline_src;
