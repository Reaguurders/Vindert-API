import {
	Table,
	Column,
	PrimaryKey,
	ForeignKey,
	BelongsTo,
	AllowNull
} from "sequelize-typescript";
import BaseModel from "../base";
import Post from "./post.model";

@Table({
	timestamps: false,
	charset: "utf8",
	collate: "utf8_unicode_ci",
	tableName: "postHistories"
})
export default class PostHistory extends BaseModel<PostHistory> {
	@ForeignKey(() => Post)
	@PrimaryKey
	@Column
	postId: number;

	@BelongsTo(() => Post)
	post: Post;

	@PrimaryKey
	@Column
	checkedAt: Date;

	@AllowNull(false)
	@Column
	views: number;

	@AllowNull(false)
	@Column
	kudos: number;

	@AllowNull(false)
	@Column
	comments: number;
}
