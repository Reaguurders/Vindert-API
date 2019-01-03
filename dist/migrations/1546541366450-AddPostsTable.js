"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
class AddPostsTable1546541366450 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.createTable(new typeorm_1.Table({
                name: "posts",
                columns: [{
                        name: "id",
                        type: "serial",
                        isPrimary: true
                    }, {
                        name: "dumpertId",
                        type: "character varying"
                    }, {
                        name: "title",
                        type: "character varying"
                    }, {
                        name: "description",
                        type: "text"
                    }, {
                        name: "thumbnail",
                        type: "character varying",
                        isNullable: true
                    }, {
                        name: "postedAt",
                        type: "timestamptz"
                    }, {
                        name: "nsfw",
                        type: "boolean"
                    }, {
                        name: "rawData",
                        type: "json"
                    }, {
                        name: "createdAt",
                        type: "timestamptz"
                    }, {
                        name: "updatedAt",
                        type: "timestamptz"
                    }]
            }));
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.dropTable("posts");
        });
    }
}
exports.AddPostsTable1546541366450 = AddPostsTable1546541366450;
//# sourceMappingURL=1546541366450-AddPostsTable.js.map