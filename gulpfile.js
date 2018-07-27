var gulp = require('gulp');
var typedoc = require("gulp-typedoc");

gulp.task("generate-docs", () => {
    return gulp
        .src(["src/core/**/*.ts", "src/models/*.ts"])
        .pipe(typedoc({
            module: "commonjs",
            target: "es6",
            out: "docs/documentation/",
            experimentalDecorators: true,
            ignoreCompilerErrors: true,
            name: "Merchant SDK v0.0.1"
        }))
    ;
});

gulp.task('default', ['generate-docs']); 