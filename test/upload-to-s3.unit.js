import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import lambdaDeploy from "../src/";

describe("`uploadToS3`", function () {

    var config = {
        GIT_BRANCH: "GIT_BRANCH",
        S3_BUCKET: "S3_BUCKET",
        BUNDLE_NAME: "BUNDLE_NAME",
        LAMBDA_NAME: "LAMBDA_NAME",
        LAMBDA_ROLE_ARN: "LAMBDA_ROLE_ARN"
    };

    var s3 = {
        upload: sinon.spy()
    };

    var createReadStream = function () {
        return "Body";
    };

    before(function () {
        lambdaDeploy.__Rewire__("s3", s3);
        lambdaDeploy.__Rewire__("config", config);
        lambdaDeploy.__Rewire__("createReadStream", createReadStream);
    });

    after(function () {
        lambdaDeploy.__ResetDependency__("config");
        lambdaDeploy.__ResetDependency__("s3");
        lambdaDeploy.__ResetDependency__("createReadStream");
    });

    it("calls `s3.upload` with the correct parameters", function () {
        var uploadToS3 = lambdaDeploy.__get__("uploadToS3");
        uploadToS3();
        expect(s3.upload).to.have.been.calledWith({
            Bucket: "S3_BUCKET",
            Key: "BUNDLE_NAME",
            Body: "Body"
        });
    });

});
