import {expect} from "chai";
import proxyquire from "proxyquire";

proxyquire.noPreserveCache();

describe("`config`", function () {

    describe("`GIT_BRANCH`", function () {

        it("takes from `process.env.GIT_BRANCH` if defined", function () {
            process.env.GIT_BRANCH = "GIT_BRANCH";
            var config = proxyquire("../src/config.js", {});
            expect(config.GIT_BRANCH).to.equal("GIT_BRANCH");
        });

        it("takes from `process.env.TRAVIS_BRANCH` if defined", function () {
            delete process.env.GIT_BRANCH;
            process.env.TRAVIS_BRANCH = "TRAVIS_BRANCH";
            var config = proxyquire("../src/config.js", {});
            expect(config.GIT_BRANCH).to.equal("TRAVIS_BRANCH");
        });

    });

    describe("`GIT_COMMIT`", function () {

        it("takes from `process.env.GIT_COMMIT` if defined", function () {
            process.env.GIT_COMMIT = "GIT_COMMIT";
            var config = proxyquire("../src/config.js", {});
            expect(config.GIT_COMMIT).to.equal("GIT_COMMIT");
        });

        it("takes from `process.env.TRAVIS_COMMIT` if defined", function () {
            delete process.env.GIT_COMMIT;
            process.env.TRAVIS_COMMIT = "TRAVIS_COMMIT";
            var config = proxyquire("../src/config.js", {});
            expect(config.GIT_COMMIT).to.equal("TRAVIS_COMMIT");
        });

    });

    describe("`GIT_PULL_REQUEST`", function () {

        it("takes from `process.env.GIT_PULL_REQUEST` if defined", function () {
            process.env.GIT_PULL_REQUEST = "GIT_PULL_REQUEST";
            var config = proxyquire("../src/config.js", {});
            expect(config.GIT_PULL_REQUEST).to.equal("GIT_PULL_REQUEST");
        });

        it("takes from `process.env.TRAVIS_PULL_REQUEST` if defined", function () {
            delete process.env.GIT_PULL_REQUEST;
            process.env.TRAVIS_PULL_REQUEST = "TRAVIS_PULL_REQUEST";
            var config = proxyquire("../src/config.js", {});
            expect(config.GIT_PULL_REQUEST).to.equal("TRAVIS_PULL_REQUEST");
        });

        it("null if `process.env.TRAVIS_PULL_REQUEST` is \"false\"", function () {
            delete process.env.GIT_PULL_REQUEST;
            process.env.TRAVIS_PULL_REQUEST = "false";
            var config = proxyquire("../src/config.js", {});
            expect(config.GIT_PULL_REQUEST).to.equal(null);
        });

    });

    describe("`GIT_TAG`", function () {

        it("takes from `process.env.GIT_TAG` if defined", function () {
            process.env.GIT_TAG = "GIT_TAG";
            var config = proxyquire("../src/config.js", {});
            expect(config.GIT_TAG).to.equal("GIT_TAG");
        });

        it("takes from `process.env.TRAVIS_TAG` if defined", function () {
            delete process.env.GIT_TAG;
            process.env.TRAVIS_TAG = "TRAVIS_TAG";
            var config = proxyquire("../src/config.js", {});
            expect(config.GIT_TAG).to.equal("TRAVIS_TAG");
        });

    });

    describe("`BUNDLE_NAME`", function () {

        it("base config", function () {
            process.env.LAMBDA_NAME = "LAMBDA_NAME";
            process.env.GIT_BRANCH = "GIT_BRANCH";
            process.env.GIT_COMMIT = "GIT_COMMIT";
            delete process.env.GIT_TAG;
            delete process.env.TRAVIS_TAG;
            delete process.env.GIT_PULL_REQUEST;
            delete process.env.TRAVIS_PULL_REQUEST;
            var config = proxyquire("../src/config.js", {});
            expect(config.BUNDLE_NAME).to.equal(
                "LAMBDA_NAME-branch_GIT_BRANCH-commit_GIT_COMMIT-bundle.zip"
            );
        });

        it("`GIT_TAG` defined", function () {
            process.env.LAMBDA_NAME = "LAMBDA_NAME";
            process.env.GIT_BRANCH = "GIT_BRANCH";
            process.env.GIT_COMMIT = "GIT_COMMIT";
            process.env.GIT_TAG = "GIT_TAG";
            delete process.env.GIT_PULL_REQUEST;
            delete process.env.TRAVIS_PULL_REQUEST;
            var config = proxyquire("../src/config.js", {});
            expect(config.BUNDLE_NAME).to.equal(
                "LAMBDA_NAME-branch_GIT_BRANCH-commit_GIT_COMMIT-tag_GIT_TAG-bundle.zip"
            );
        });

        it("`GIT_PULL_REQUEST` defined", function () {
            process.env.LAMBDA_NAME = "LAMBDA_NAME";
            process.env.GIT_BRANCH = "GIT_BRANCH";
            process.env.GIT_COMMIT = "GIT_COMMIT";
            delete process.env.GIT_TAG;
            delete process.env.TRAVIS_TAG;
            process.env.GIT_PULL_REQUEST = "GIT_PULL_REQUEST";
            var config = proxyquire("../src/config.js", {});
            expect(config.BUNDLE_NAME).to.equal(
                "LAMBDA_NAME-branch_GIT_BRANCH-commit_GIT_COMMIT-pr_GIT_PULL_REQUEST-bundle.zip"
            );
        });

    });

});
