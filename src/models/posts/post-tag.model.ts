import {
	Table,
	Column,
	PrimaryKey,
	ForeignKey,
	BelongsTo
} from "sequelize-typescript";
import BaseModel from "../base";
import Post from "./post.model";

@Table({
	timestamps: true,
	charset: "utf8",
	collate: "utf8_unicode_ci",
	tableName: "postTags"
})
export default class PostTag extends BaseModel<PostTag> {
	@ForeignKey(() => Post)
	@PrimaryKey
	@Column
	postId: number;

	@BelongsTo(() => Post)
	post: Post;

	@PrimaryKey
	@Column
	tag: string;
}
