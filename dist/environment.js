"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const packageJson = require("../package.json");
class Environment {
    static getName() {
        return config.get("environment");
    }
    static getPackage() {
        return packageJson;
    }
    static isTest() {
        return this.getName() === "test";
    }
    static isDevelopment() {
        return this.getName() === "development";
    }
    static isProduction() {
        return this.getName() === "production";
    }
}
Environment.config = config;
exports.default = Environment;
//# sourceMappingURL=environment.js.map