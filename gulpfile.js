const { src, dest, watch, series, parallel } = require("gulp")
const ejs = require("gulp-ejs")
const rename = require("gulp-rename")
const sass = require("gulp-sass")
const plumber = require("gulp-plumber")
const notify = require("gulp-notify")
const sassGlob = require("gulp-sass-glob")
const mmq = require("gulp-merge-media-queries")
const postcss = require("gulp-postcss")
const autoprefixer = require("autoprefixer")
const cssdeclsort = require("css-declaration-sorter")
const browserSync = require("browser-sync")
const imagemin = require("gulp-imagemin")
const imageminPngquant = require("imagemin-pngquant")
const imageminMozjpeg = require("imagemin-mozjpeg")
const imageminOption = [
  imageminPngquant({ quality: [0.65, 0.8] }),
  imageminMozjpeg({ quality: 85 }),
  imagemin.gifsicle({
    interlaced: false,
    optimizationLevel: 1,
    colors: 256,
  }),
  imageminMozjpeg(),
  imagemin.optipng(),
  imagemin.svgo(),
]

const srcEjs = ["./ejs/**/*.ejs", "!ejs/**/_*.ejs"]
const srcSass = "./sass/**/*.scss"

const watchTasks = () => {
  watch(srcSass, taskSass)
  watch(srcSass, taskBsReload)
  // watch("./js/*.js", taskBsReload)
  // watch("./*.html", taskBsReload)
  watch(srcEjs, taskEjs)
  watch(srcEjs, taskBsReload)
}

const taskEjs = cb => {
  src(srcEjs)
    .pipe(ejs({}))
    .pipe(rename({ extname: ".html" }))
    .pipe(dest("./"))
  cb()
}

const taskSass = () => {
   src(srcSass)
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(postcss([autoprefixer()]))
    .pipe(postcss([cssdeclsort({ order: "alphabetical" })]))
    .pipe(mmq())
    .pipe(dest("./css"))
}

const taskBrowserSync = cb => {
  browserSync.init({
      server: {
          baseDir: "./",
          index: "index.html",
      },
  })
  cb()
}

const taskBsReload = cb => {
  browserSync.reload()
  cb()
}

const taskImagemin = () => {
  return src("./img/**/*")
    .pipe(imagemin(imageminOption))
    .pipe(dest("./img"))
}

exports.default = series(parallel(taskBrowserSync, watchTasks))
exports.ejs = taskEjs
exports.sass = taskSass
exports.imagemin = taskImagemin