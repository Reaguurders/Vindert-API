import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn
} from "typeorm";

@Entity({
	name: "posts"
})
export class Post {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	dumpertId: string;

	@Column()
	title: string;

	@Column("text")
	description: string;

	@Column()
	thumbnail?: string;

	@Column()
	postedAt: Date;

	@Column()
	nsfw: boolean;

	@Column("json")
	rawData: object;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
