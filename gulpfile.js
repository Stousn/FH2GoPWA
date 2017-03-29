'use strict'

const gulp = require('gulp');
const runSequence = require('run-sequence');
const concatCss = require('gulp-concat-css');
const rollup = require('rollup').rollup;
const commonjs = require('rollup-plugin-commonjs');
const strip = require('rollup-plugin-strip');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');
const babel = require('rollup-plugin-babel');
const swPrecache = require('sw-precache');
const del = require('del');


gulp.task('default', ['build']);

gulp.task('clean', ()=>{
  del('./public/*')
})

gulp.task('dev', () => {
  runSequence('copy', 'css', 'rollup-dev', 'sw');
})

gulp.task('build', () => {
  runSequence('copy', 'css', 'rollup-build' , 'sw');
})

// bundles each css file into a single file
gulp.task('css', () => {
  return gulp.src('./src/css/*.css')
  .pipe(concatCss('css/style.css'))
  .pipe(gulp.dest('./public/'));
})

// builds the application
// transcompile to es2015
// removes console.logs
gulp.task('rollup-build', () => {
  return rollup({
    entry: './src/js/app.js',
    plugins: [
      babel({
        exclude: 'node_modules/**'
      }),
      resolve({
        module: true,
        jsnext: true,
        main: true,
        browser: true
      }),
      commonjs({
         namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        'src/js/external/crypto-js/crypto-js.js': [ 'CryptoJS' ]
      }
      }),
      strip({
        functions: [ 'console.log'],
      })
    ]
  }).then(bundle => {
    return bundle.write({
      format: 'iife',
      dest: './public/js/app.js'
    })
  })
})

// same as rollup-build,
// but without removing the console.logs
gulp.task('rollup-dev', () => {
  return rollup({
    entry: './src/js/app.js',
    plugins: [
      babel({
        exclude: 'node_modules/**'
      }),
      resolve({
        module: true,
        jsnext: true,
        main: true,
        browser: true
      }),
      commonjs({
         namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        'src/js/external/crypto-js/crypto-js.js': [ 'CryptoJS' ]
      }
      }),
      uglify()
    ]
  }).then(bundle => {
    return bundle.write({
      format: 'iife',
      dest: './public/js/app.js'
    })
  })
})

// copy all static files
gulp.task('copy', () => {
  gulp.src([
    'src/**',
    '!src/js/**',
    '!src/css/*.css'
  ]).pipe(gulp.dest('./public/'));
})

// builds a service-worker with swPrecache
gulp.task('sw', (cb) => {
  swPrecache.write('public/sw.js', {
    staticFileGlobs: ['public' + '/**/*.{js,html,css,png,svg,jpg}'],
    stripPrefix: 'public',
    navigateFallback: '/index.html',
  },cb)
})

// watches for changes in the src dir and rebuilds the app
gulp.task('watch', () => {
  gulp.watch('src/**', ['dev']);
})