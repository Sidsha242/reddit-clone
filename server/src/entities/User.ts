import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true }) //username is unique
  username!: string;

  @Field()
  @Column({ unique: true }) //username is unique
  email!: string;

  @Column() //not exposed    we will hash this and store
  password!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[]; //Array of posts

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}

//@Field exposes to graphql
//will alter post table to make this
