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
        process.env["FUNC_CONFIG:A"] = "A";
        process.env["FUNC_CONFIG:B"] = "B";
        process.env["FUNC_CONFIG:C"] = "C";
        process.env["FUNC_CONFIG:D"] = "D";
        configure();
        expect(writeFileSync.firstCall.args[1]).to.equal([
            "A=A",
            "B=B",
            "C=C",
            "D=D"
        ].join("\n"));
    });

});
