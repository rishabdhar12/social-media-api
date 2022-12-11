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
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id?: number;

  @Field()
  @Column(() => String)
  title: string;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.id)
  post: Post;

  @Field(() => String)
  @CreateDateColumn()
  createdAt?: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt?: Date;

  @Field()
  @Column(() => Boolean)
  isEdited: boolean;
}
