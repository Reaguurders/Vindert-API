"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const make_error_1 = require("make-error");
class AppError extends make_error_1.BaseError {
    constructor(message) {
        super(message || "application error");
        this.code = "applicationError";
        this.statusCode = 500;
        this.data = {};
    }
    toJSON() {
        let temp = {};
        Object.getOwnPropertyNames(this).forEach((key) => {
            temp[key] = this[key];
        });
        return temp;
    }
}
exports.AppError = AppError;
//# sourceMappingURL=app.error.js.map