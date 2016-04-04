import express from "express";
import {json} from "body-parser";

import {DynamoDB, Lambda, S3} from "aws-sdk";
import BPromise from "bluebird";
import {execSync} from "child_process";
import {createReadStream, writeFileSync} from "fs";
import gulp from "gulp";
import babel from "gulp-babel";
import zip from "gulp-zip";
import git from "nodegit";

var deploy = {
    aws: {
        region: "",
        accessKeyId: "",
        secretAccessKey: ""
    },
    services: {
        s3: {
            eventsBucket: "lk-events-bucket-env-name",
            lambdasBucket: "lk-lambdas-bucket-env-name"
        },
        kinesis: {
            streamName: "lk-kinesis-stream-env-name"
        },
        lambda: {
            id: "lambda-my-name",
            name: "lambda-my-name",
            defaultConfiguration: {
                environment: [
                    {
                        key: "my-key",
                        value: "my-value"
                    }
                ],
                git: {
                    url: "https://github.com/jonschlinkert/pad-left.git",
                    branch: "master"
                },
                role: "arn:aws:iam::747362668057:role/lambda_basic_execution"
            }
        }
    }
};

var dynamoDB = new DynamoDB.DocumentClient({
    region: deploy.aws.region,
    accessKeyId: deploy.aws.accessKeyId,
    secretAccessKey: deploy.aws.secretAccessKey
});

var lambda = new Lambda({
    apiVersion: "2015-03-31",
    region: deploy.aws.region,
    accessKeyId: deploy.aws.accessKeyId,
    secretAccessKey: deploy.aws.secretAccessKey
});

var s3 = new S3({
    apiVersion: "2006-03-01",
    region: deploy.aws.region,
    accessKeyId: deploy.aws.accessKeyId,
    secretAccessKey: deploy.aws.secretAccessKey
});

var compile = function compile () {
    return new BPromise((resolve, reject) => {
        try {
            execSync("rm -r checkout/");
        } catch (e) {
            console.log("task=fs");
        }
        try {
            execSync("rm -r __BUILD__/");
        } catch (e) {
            console.log("task=fs");
        }
        console.log("task=checkout");
        var cloneOptions = new git.CloneOptions();
        cloneOptions.checkoutBranch = deploy.services.lambda.defaultConfiguration.git.branch;
        git.Clone(deploy.services.lambda.defaultConfiguration.git.url, "checkout", cloneOptions).then(() => {
            console.log("task=compile");
            gulp.src("checkout/**/*.js")
                .pipe(babel({
                    presets: ["es2015"]
                }))
                .pipe(gulp.dest("__BUILD__/bundle/"))
                .on("end", resolve)
                .on("error", reject);
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
};

var install = function install () {
    console.log("task=install");
    execSync("cp checkout/package.json __BUILD__/bundle/");
    execSync("npm install --production", {
        cwd: "__BUILD__/bundle/"
    });
};

var configure = function configure () {
    console.log("task=configure");
    var env = deploy.services.lambda.defaultConfiguration.environment.reduce((previous, value) => {
        return previous + value.key + "=" + value.value + "\n";
    }, "");
    writeFileSync("__BUILD__/bundle/.env", env, "utf8");
};

var bundle = function bundle () {
    console.log("task=bundle");
    return new BPromise((resolve, reject) => {
        gulp.src(["__BUILD__/bundle/**/*", "__BUILD__/bundle/.env"])
            .pipe(zip("bundle.zip"))
            .pipe(gulp.dest("__BUILD__/"))
            .on("end", resolve)
            .on("error", reject);
    });
};

var uploadToS3 = function uploadToS3 () {
    console.log("task=uploadS3");
    var params = {
        Bucket: deploy.services.s3.lambdasBucket,
        Key: deploy.services.lambda.name + ".zip",
        Body: createReadStream("__BUILD__/bundle.zip")
    };
    var upload = BPromise.promisify(s3.upload, s3);
    return upload(params).catch((err) => {
        throw err;
    });
};

var updateLambda = function updateLambda () {
    console.log("task=uploadLambda");
    var createParams = {
      Code: {
        S3Bucket: deploy.services.s3.lambdasBucket,
        S3Key: deploy.services.lambda.name + ".zip"
      },
      FunctionName: deploy.services.lambda.name,
      Handler: "index.handler",
      Role: deploy.services.lambda.defaultConfiguration.role,
      Runtime: "nodejs"
    };
    var updateParams = {
        FunctionName: deploy.services.lambda.name,
        S3Bucket: deploy.services.s3.lambdasBucket,
        S3Key: deploy.services.lambda.name
    };
    var createFunction = BPromise.promisify(lambda.createFunction, lambda);
    return createFunction(createParams)
        .catch((err) => {
            if (err.code === "ResourceConflictException") {
                // Lambda function already exists, update it
                return lambda.updateFunctionCode(updateParams);
            }
            throw err;
        });
};

var save = function save () {
    console.log("task=save");
    var params = {
        TableName: "lk-deploy-deployments",
        Item: {
            env: deploy,
            deploy: {
                date: new Date().toISOString()
            }
        }
    };
    var put = BPromise.promisify(dynamoDB.put, dynamoDB);
    return put(params).catch((err) => {
        throw err;
    });
};

var clean = function clean () {
    console.log("task=clean");
    try {
        execSync("rm -r checkout/");
        execSync("rm -r __BUILD__/");
    } catch (err) {
        console.error(err);
    }
};

var lambdaDeploy = function (req, res) {
    deploy = req.body;
    return BPromise.resolve()
        .then(compile)
        .then(install)
        .then(configure)
        .then(bundle)
        .then(uploadToS3)
        .then(updateLambda)
        .then(save)
        .then(clean)
        .then(() => {
            res.status(200).send(req.params);
        })
        .catch((err) => {
            res.status(500).send({
                error: true,
                message: err
           });
        });
};

express().use(json())
    .post("/deploy", lambdaDeploy)
    .listen(8888, () => {
        console.log("Server listening on port 8888");
    });
