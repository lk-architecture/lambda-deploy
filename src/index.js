import BPromise from "bluebird";
import {execSync} from "child_process";
import {createReadStream, writeFileSync} from "fs";
import gulp from "gulp";
import babel from "gulp-babel";
import zip from "gulp-zip";

import * as  config from "./config";
import * as lambda from "./lambda";
import * as s3 from "./s3";

var compile = function compile () {
    return new BPromise((resolve, reject) => {
        gulp.src("src/**/*.js")
            .pipe(babel())
            .pipe(gulp.dest("__BUILD__/bundle/"))
            .on("end", resolve)
            .on("error", reject);
    });
};

var install = function install () {
    execSync("cp package.json __BUILD__/bundle/");
    execSync("npm install --production", {
        cwd: "__BUILD__/bundle/"
    });
};

var configure = function configure () {
    var prefix = "__FUNC_CONFIG__";
    var env = Object.keys(process.env)
        .filter(key => key.slice(0, prefix.length) === prefix)
        .map(key => key.slice(prefix.length) + "=" + process.env[key])
        .join("\n");
    writeFileSync("__BUILD__/bundle/.env", env, "utf8");
};

var bundle = function bundle () {
    return new BPromise((resolve, reject) => {
        gulp.src("__BUILD__/bundle/**/*")
            .pipe(zip("bundle.zip"))
            .pipe(gulp.dest("__BUILD__/"))
            .on("end", resolve)
            .on("error", reject);
    });
};

var uploadToS3 = function uploadToS3 () {
    var params = {
        Bucket: config.S3_BUCKET,
        Key: config.BUNDLE_NAME,
        Body: createReadStream("__BUILD__/bundle.zip")
    };
    return s3.upload(params);
};

var updateLambda = function updateLambda () {
    var createParams = {
      Code: {
        S3Bucket: config.S3_BUCKET,
        S3Key: config.BUNDLE_NAME
      },
      FunctionName: config.LAMBDA_NAME + "_" + config.GIT_BRANCH,
      Handler: "index.handler",
      Role: config.LAMBDA_ROLE_ARN,
      Runtime: "nodejs"
    };
    var updateParams = {
        FunctionName: config.LAMBDA_NAME + "_" + config.GIT_BRANCH,
        S3Bucket: config.S3_BUCKET,
        S3Key: config.BUNDLE_NAME
    };
    return lambda.createFunction(createParams)
        .catch(function (err) {
            if (err.code === "ResourceConflictException") {
                // Lambda function already exists, update it
                return lambda.updateFunctionCode(updateParams);
            }
            throw err;
        });
};

var clean = function clean () {
    try {
        execSync("rm -r __BUILD__/");
    } catch (err) {
        console.error(err);
    }
};

export default function lambdaDeploy () {
    return BPromise.resolve()
        .then(compile)
        .then(install)
        .then(configure)
        .then(bundle)
        .then(uploadToS3)
        .then(updateLambda)
        .then(clean);
}
