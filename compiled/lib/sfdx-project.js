"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageDirectory = void 0;
const core_1 = require("@salesforce/core");
const constants_1 = require("./constants");
class PackageDirectory {
    constructor() {
        this.path = null;
        this.default = false;
    }
}
exports.PackageDirectory = PackageDirectory;
class SfdxProject {
    constructor() {
        this.packageDirectories = [];
        this.namespace = '';
        this.sfdcLoginUrl = constants_1.default.DEFAULT_SFDC_LOGIN_URL;
        this.sourceApiVersion = constants_1.default.DEFAULT_PACKAGE_VERSION;
    }
    static async default() {
        if (!SfdxProject.defaultInstance) {
            SfdxProject.defaultInstance = await SfdxProject.deserialize();
        }
        return SfdxProject.defaultInstance;
    }
    static async deserialize(projectFilePath) {
        const project = await core_1.SfdxProject.resolve(projectFilePath);
        const projectJson = await project.resolveProjectConfig();
        return Object.assign(new SfdxProject(), projectJson);
    }
    getDefaultDirectory() {
        if (!this.packageDirectories) {
            return null;
        }
        for (const packageDirectory of this.packageDirectories) {
            if (packageDirectory.default) {
                return packageDirectory.path;
            }
        }
        return null;
    }
}
exports.default = SfdxProject;
//# sourceMappingURL=sfdx-project.js.map