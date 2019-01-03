import { BaseError } from "make-error";

export class AppError extends BaseError {
	public code: string;
	public statusCode: number;
	public data: any;

	constructor(message: string) {
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
