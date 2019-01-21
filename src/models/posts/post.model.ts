import {
	Table,
	Column,
	PrimaryKey,
	CreatedAt,
	UpdatedAt,
	AutoIncrement,
	DataType,
	AllowNull,
	HasMany,
	AfterUpdate,
	AfterCreate,
	DefaultScope,
	DeletedAt
} from "sequelize-typescript";
import BaseModel from "../base";
import PostTag from "./post-tag.model";
import PostHistory from "./post-history.model";

@DefaultScope({
	attributes: [
		"id",
		"dumpertId",
		"title",
		"description",
		"thumbnail",
		"postedAt",
		"nsfw",
		"videoCount",
		"imageCount",
		"audioCount"
	]
})
@Table({
	timestamps: true,
	paranoid: true,
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

	@HasMany(() => PostHistory)
	histories: PostHistory[];

	@Column(DataType.JSON)
	rawData: object;

	@Column
	videoCount: number;

	@Column
	imageCount: number;

	@Column
	audioCount: number;

	@Column(DataType.VIRTUAL)
	views: number;

	@Column(DataType.VIRTUAL)
	kudos: number;

	@Column(DataType.VIRTUAL)
	comments: number;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt?: Date;

	static parseTags(tagsString: string): string[] {
		if (tagsString === "") {
			return [];
		}

		let tags = tagsString.split(" ");
		let unique = new Set(tags);

		return [...unique];
	}

	@AfterCreate
	@AfterUpdate
	static async updateSearchable(post: Post, options: any): Promise<Post> {
		let transaction = options.transaction;

		await post.sequelize.query(`
			UPDATE "posts" SET "searchable" = to_tsvector(
				'dutch_nostop',
				title || ' ' || description || ' ' || :tags
			)
			WHERE id = :id
		`, {
			replacements: {
				id: post.id,
				tags: (post.tags || []).map(t => t.tag).join(" ")
			},
			transaction
		});

		return post;
	}
}
