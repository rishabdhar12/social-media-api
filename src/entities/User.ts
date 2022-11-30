import { ObjectType, Field } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
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
  name: string;

  @Field()
  @Column()
  username: string;

  @Field()
  @Column()
  email: string;

  // @Field()
  @Column()
  password: string;

  @Field(() => Boolean)
  @Column({ nullable: true, default: false })
  termsAccepted: boolean;

  @Field(() => Boolean)
  @Column({ nullable: true, default: false })
  isAdmin: boolean;

  @Field(() => [String])
  @Column("simple-array", { nullable: true })
  following?: string[];

  @Field(() => [String])
  @Column("simple-array", { nullable: true })
  followers?: string[];

  @Field(() => [String])
  @Column("simple-array", { nullable: true })
  friends?: string[];

  @Field(() => [String])
  @Column("simple-array", { nullable: true })
  friendRequestsSent?: string[];

  @Field(() => [String])
  @Column("simple-array", { nullable: true })
  friendRequestsReceived?: string[];

  @Field(() => Number)
  @Column({ nullable: true, default: 0 })
  totalFriends?: number;

  @Field(() => [String])
  @Column("simple-array", { nullable: true })
  blocked?: string[];
}
