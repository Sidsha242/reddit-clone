import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType() //using this we have converted this class to graphql type..also Field and you can set types like Int
@Entity() //class that maps database table
export class Post extends BaseEntity {
  //BaseEntity is a class that has some helper functions
  @Field(() => Int) //Corresponds to Column in Table
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String) //Corresponds to Column in Table
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  title!: string;
}

//@Field exposes to graphql
