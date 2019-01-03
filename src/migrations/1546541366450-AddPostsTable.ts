import {
	MigrationInterface,
	QueryRunner,
	Table
} from "typeorm";

export class AddPostsTable1546541366450 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.createTable(new Table({
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
	}

	public async down(queryRunner: QueryRunner): Promise<any> {
		await queryRunner.dropTable("posts");
	}

}
