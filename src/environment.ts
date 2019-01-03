import * as config from "config";
const packageJson = require("../package.json");

export default class Environment {
	public static readonly config = config;

	static getName(): string {
		return config.get("environment");
	}

	static getPackage(): { [key: string]: any } {
		return packageJson;
	}

	static isTest(): boolean {
		return this.getName() === "test";
	}

	static isDevelopment(): boolean {
		return this.getName() === "development";
	}

	static isProduction(): boolean {
		return this.getName() === "production";
	}
}
