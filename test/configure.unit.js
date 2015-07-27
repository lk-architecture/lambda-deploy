import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import lambdaDeploy from "../src/";

describe("`configure`", function () {

    var writeFileSync = sinon.spy();

    before(function () {
        lambdaDeploy.__Rewire__("writeFileSync", writeFileSync);
    });

    after(function () {
        lambdaDeploy.__ResetDependency__("writeFileSync");
    });

    it("calls `s3.upload` with the correct parameters", function () {
        var configure = lambdaDeploy.__get__("configure");
        process.env.__FUNC_CONFIG__A = "A";
        process.env.__FUNC_CONFIG__B = "B";
        process.env.__FUNC_CONFIG__C = "C";
        process.env.__FUNC_CONFIG__D = "D";
        configure();
        expect(writeFileSync.firstCall.args[1]).to.equal([
            "A=A",
            "B=B",
            "C=C",
            "D=D"
        ].join("\n"));
    });

});
