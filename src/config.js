var e = process.env;

export var GIT_BRANCH = e.GIT_BRANCH || e.TRAVIS_BRANCH;
export var GIT_COMMIT = e.GIT_COMMIT || e.TRAVIS_COMMIT;
export var GIT_PULL_REQUEST = e.GIT_PULL_REQUEST || (e.TRAVIS_PULL_REQUEST !== "false" ? e.TRAVIS_PULL_REQUEST : null);
export var GIT_TAG = e.GIT_TAG || e.TRAVIS_TAG;

export var AWS_ACCESS_KEY_ID = e.AWS_ACCESS_KEY_ID;
export var AWS_SECRET_ACCESS_KEY = e.AWS_SECRET_ACCESS_KEY;
export var AWS_REGION = e.AWS_DEFAULT_REGION;

export var LAMBDA_NAME = e.LAMBDA_NAME;
export var LAMBDA_ROLE_ARN = e.LAMBDA_ROLE_ARN;

export var S3_BUCKET = e.S3_BUCKET;
export var BUNDLE_NAME = [
    LAMBDA_NAME,
    "branch_" + GIT_BRANCH,
    "commit_" + GIT_COMMIT,
    GIT_TAG ? "tag_" + GIT_TAG : null,
    GIT_PULL_REQUEST ? "pr_" + GIT_PULL_REQUEST : null,
    "bundle.zip"
].filter(i => !!i).join("-");
