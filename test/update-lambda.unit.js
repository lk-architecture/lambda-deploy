import BPromise from "bluebird";
import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import lambdaDeploy from "../src/";

describe("`updateLambda`", function () {

    var config = {
        GIT_BRANCH: "GIT_BRANCH",
        S3_BUCKET: "S3_BUCKET",
        BUNDLE_NAME: "BUNDLE_NAME",
        LAMBDA_NAME: "LAMBDA_NAME",
        LAMBDA_ROLE_ARN: "LAMBDA_ROLE_ARN"
    };

    before(function () {
        lambdaDeploy.__Rewire__("config", config);
    });

    after(function () {
        lambdaDeploy.__ResetDependency__("config");
    });

    afterEach(function () {
        lambdaDeploy.__ResetDependency__("lambda");
    });

    it("calls `lambda.createFunction` with the correct parameters", function () {
        var lambda = {
            createFunction: sinon.stub().returns(BPromise.resolve())
        };
        lambdaDeploy.__Rewire__("lambda", lambda);
        var updateLambda = lambdaDeploy.__get__("updateLambda");
        updateLambda();
        expect(lambda.createFunction).to.have.been.calledWith({
            Code: {
              S3Bucket: "S3_BUCKET",
              S3Key: "BUNDLE_NAME"
            },
            FunctionName: "LAMBDA_NAME_GIT_BRANCH",
            Handler: "index.handler",
            Role: "LAMBDA_ROLE_ARN",
            Runtime: "nodejs"
        });
    });

    it("on `lambda.createFunction` error, calls `lambda.updateFunctionCode` with the correct parameters", function () {
        var lambda = {
            createFunction: sinon.stub().returns(BPromise.reject({
                code: "ResourceConflictException"
            })),
            updateFunctionCode: sinon.stub().returns(BPromise.resolve())
        };
        lambdaDeploy.__Rewire__("lambda", lambda);
        var updateLambda = lambdaDeploy.__get__("updateLambda");
        return updateLambda()
            .then(function () {
                expect(lambda.updateFunctionCode).to.have.been.calledWith({
                    FunctionName: "LAMBDA_NAME_GIT_BRANCH",
                    S3Bucket: "S3_BUCKET",
                    S3Key: "BUNDLE_NAME"
                });
            });
    });

});
