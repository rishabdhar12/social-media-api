import { ObjectType, Field } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne,
  // OneToMany,
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id?: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt?: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt?: Date;

  @Field()
  @Column()
  title?: string;

  @Field()
  @Column()
  description?: string;

  // post image
  // @Field(() => [Photo])
  // @OneToMany(() => Photo, (photo) => photo.post)
  // photos?: Photo[];

  // user creator
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  creatorId?: User;

  @Field(() => Comment)
  @ManyToOne(() => Comment, (comment) => comment.id)
  comment?: Comment;

  @Field(() => Number)
  @Column({ nullable: true, default: 0 })
  totalLikes?: number;

  @Field(() => Number)
  @Column({ nullable: true, default: 0 })
  totalComments?: number;

  @Field(() => String)
  @Column({ nullable: true, default: "active" })
  // "active", "deleted", "reported", "flagged", "banned", "muted", "verified", "unverified",
  postStatus?: string;

  @Field(() => String)
  @Column({ nullable: true, default: "public" })
  // "public", "private", "friends, "followers", "mutual", "close_friends"
  visibility?: string;

  @Field(() => [String])
  @Column("simple-array", { nullable: true })
  hashTags?: string[];

  // tag users
  @Field(() => [String])
  @Column("simple-array", { nullable: true })
  taggedUsers?: string[];

  // reported by
  @Field(() => [String])
  @Column("simple-array", { nullable: true })
  reportedBy?: string[];
}
  
