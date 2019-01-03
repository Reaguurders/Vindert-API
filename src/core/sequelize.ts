import Environment from "../environment";
import { Sequelize } from "sequelize-typescript";
import * as path from "path";
import * as url from "url";

import { types } from "pg";

types.setTypeParser(20, (value) => {
	if (value === null) {
		return null;
	}

	if (typeof value === "string" && value.length >= Number.MAX_SAFE_INTEGER.toString().length - 1) {
		// TODO: PANIC PANIC PANIC, NUMBERS GETTING TOO BIG, FIX, SEND SLACK MESSAGE
		return value;
	}

	return parseInt(value, 10);
});

types.setTypeParser(1016, (value) => {
	if (value.length > 2) {
		value = value.substring(1, value.length - 1);
		value = value.split(",").map(v => parseInt(v, 10));

		return value;
	}

	return [];
});

let databaseConfig: any = Object.assign({}, Environment.config.get("sequelize"));

if (!databaseConfig.dialectOptions) {
	databaseConfig.dialectOptions = {
		ssl: {
			require: true
		}
	};
}

let databaseUri = url.parse(databaseConfig.url);
databaseConfig.modelPaths = databaseConfig.modelPaths.map((modelPath: string) => {
	return path.resolve(__dirname, modelPath);
});
databaseConfig.host = databaseUri.host;
databaseConfig.port = databaseUri.port || 5432;
databaseConfig.database = databaseUri.pathname.substr(1);
if (databaseUri.auth) {
	let auth = databaseUri.auth.split(":");
	databaseConfig.username = auth[0];
	databaseConfig.password = auth[1];
}

if (databaseConfig.logging) {
	databaseConfig.logging = console.log;
}

export const sequelize = new Sequelize(databaseConfig);
