import {
	Table,
	Column,
	PrimaryKey,
	CreatedAt,
	UpdatedAt,
	AutoIncrement,
	DataType,
	AllowNull,
	HasMany
} from "sequelize-typescript";
import BaseModel from "../base";
import PostTag from "./post-tag.model";

@Table({
	timestamps: true,
	charset: "utf8",
	collate: "utf8_unicode_ci",
	tableName: "posts"
})
export default class Post extends BaseModel<Post> {
	@AutoIncrement
	@PrimaryKey
	@Column
	id: number;

	@AllowNull(false)
	@Column
	dumpertId: string;

	@AllowNull(false)
	@Column
	title: string;

	@AllowNull(false)
	@Column(DataType.TEXT)
	description: string;

	@AllowNull(true)
	@Column
	thumbnail?: string;

	@AllowNull(false)
	@Column
	postedAt: Date;

	@AllowNull(false)
	@Column
	nsfw: boolean;

	@HasMany(() => PostTag)
	tags: PostTag[];

	@Column(DataType.JSON)
	rawData: object;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;
}
