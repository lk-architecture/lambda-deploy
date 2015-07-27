import BPromise from "bluebird";
import {S3} from "aws-sdk";

import * as config from "./config";

var s3 = new S3({
    apiVersion: "2006-03-01",
    region: config.AWS_REGION,
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
});

export var upload = BPromise.promisify(s3.upload, s3);
