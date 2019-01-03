require("dotenv").config();
const config = require("config");
const url = require("url");

let databaseConfig = Object.assign({}, config.get("sequelize"));
databaseConfig.dialectOptions = {
	ssl: {
		require: true
	}
}

if (databaseConfig.logging) {
	databaseConfig.logging = console.log;
} else {
	databaseConfig.logging = undefined;
}

module.exports = {};
["development", "test", "production"].forEach((env) => {
	module.exports[env] = databaseConfig;
});
