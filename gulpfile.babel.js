import gulp from "gulp";
import babel from "gulp-babel";
import eslint from "gulp-eslint";
import mocha from "gulp-spawn-mocha";

gulp.task("build", function () {
    return gulp.src("src/**/*.js")
        .pipe(babel())
        .pipe(gulp.dest("dist/"));
});

gulp.task("test", function () {
    return gulp.src(["test/unit/**/*.js"], {read: false})
        .pipe(mocha({
            compilers: "js:babel/register",
            env: {
                NODE_ENV: "test"
            },
            istanbul: true
        }));
});

gulp.task("lint", function () {
    return gulp.src(["src/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task("default", ["test", "lint"], function () {
    return gulp.watch(["src/**/*.js", "test/**/*.js"], ["test", "lint"]);
});
