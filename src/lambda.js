import BPromise from "bluebird";
import {Lambda} from "aws-sdk";

import * as config from "./config";

var lambda = new Lambda({
    apiVersion: "2015-03-31",
    region: config.AWS_REGION,
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
});

export var createFunction = BPromise.promisify(lambda.createFunction, lambda);
export var updateFunctionCode = BPromise.promisify(lambda.updateFunctionCode, lambda);
