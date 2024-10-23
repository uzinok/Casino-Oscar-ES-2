import {
	readFileSync,
	rmSync
} from 'node:fs';

import gulp from 'gulp';
import plumber from 'gulp-plumber';

import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import postUrl from 'postcss-url';
import autoprefixer from 'autoprefixer';
import gcmq from 'gulp-group-css-media-queries';

import babel from 'gulp-babel';
import minify from 'gulp-minify';

import serverSynk from 'browser-sync';
const browserSync = serverSynk.create();

const {
	src,
	dest,
	watch,
	series,
	parallel
} = gulp;
const sass = gulpSass(dartSass);
let isDevelopment = true;

const paths = {
	dest: 'dest',
	src: 'src',
	styles: {
		src: 'src/styles/*.scss',
		watch: 'src/styles/**/*.scss',
		dest: 'dest/styles/'
	},
	scripts: {
		src: 'src/scripts/**/*.js',
		watch: 'src/scripts/**/*.js',
		dest: 'dest/scripts/'
	},
	html: {
		src: 'src/**/*.html',
		watch: 'src/**/*.html',
		dest: 'dest/'
	},
	img: {
		resource: './src/resource/img',
		resourceSvg: './src/resource/svg',
		src: './src/',
	},
	fonts: {
		src: './src/fonts',
		resource: './src/resource/fonts',
	}
}

export function clean(done) {
	rmSync(paths.dest, {
		force: true,
		recursive: true,
	});
	done();
}

export function copy() {
	return src([
			"./src/fonts/*.{woff2,woff}",
			"./src/*.ico",
			"./src/img/**/*.{svg,jpg,jpeg,png,webp,avif}",
			"./src/video/**/*.{mp4,webm}",
			"./src/static/**/*.{css,js}",
		], {
			base: paths.src
		})
		.pipe(dest(paths.dest));
}

export function styles() {
	return src(paths.styles.src, {
			sourcemaps: isDevelopment
		})
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(gcmq())
		.pipe(postcss([
			postUrl({
				assetsPath: '../'
			}),
			autoprefixer(),
		]))
		.pipe(dest(paths.styles.dest))
		.pipe(browserSync.stream());
}

export function html() {
	return src(paths.html.src)
		.pipe(dest(paths.html.dest))
		.pipe(browserSync.stream());
}

export function scripts() {
	return src(paths.scripts.src)
		.pipe(plumber())
		.pipe(babel({
			presets: ['@babel/preset-env']
		}))
		.pipe(minify({
			ext: {
				src: '.js',
				min: '.min.js'
			},
			exclude: ['tasks']
		}))
		.pipe(dest(paths.scripts.dest))
		.pipe(browserSync.stream());
}

export function watchFiles() {
	watch(paths.styles.watch, styles)
	watch(paths.scripts.watch, scripts)
	watch(paths.html.watch, html)
}

function server() {
	browserSync.init({
		server: {
			baseDir: paths.dest
		}
	});

	watchFiles();
}

export function start(done) {
	return series(clean, copy, parallel(scripts, styles, html), server)(done);
}

export function build(done) {
	return series(clean, copy, parallel(scripts, styles, html))(done);
}

// дополнительные задачи

import ttf2woff2 from 'gulp-ttf2woff2';
import ttf2woff from 'gulp-ttf2woff';

export function fonts() {
	src([paths.fonts.resource + '/*.ttf'])
		.pipe(ttf2woff())
		.pipe(dest(paths.fonts.src));
	return src([paths.fonts.resource + '/*.ttf'])
		.pipe(ttf2woff2())
		.pipe(dest(paths.fonts.src));
}
