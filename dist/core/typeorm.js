"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("../environment");
const typeorm_1 = require("typeorm");
const typeorm_naming_scheme_1 = require("../helpers/typeorm-naming-scheme");
// @ts-ignore
typeorm_1.createConnection(Object.assign({}, environment_1.default.config.get("typeorm"), { namingStrategy: new typeorm_naming_scheme_1.NamingStrategy() }));
//# sourceMappingURL=typeorm.js.map