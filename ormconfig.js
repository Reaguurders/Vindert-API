require("dotenv").config();
const config = require("config");
const NamingStrategy = require("./dist/helpers/typeorm-naming-scheme");

module.exports = {
	...config.get("typeorm"),
	namingStrategy: new NamingStrategy()
};