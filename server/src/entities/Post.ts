import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType() //using this we have converted this class to graphql type..also Field and you can set types like Int
@Entity() //class that maps database table
export class Post extends BaseEntity {
  //BaseEntity is a class that has some helper functions
  @Field(() => Int) //Corresponds to Column in Table
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId: number;

  @ManyToOne(() => User, (user) => user.posts)
  creator: User; //creater of post..not exposed to graphql

  @Field(() => String) //Corresponds to Column in Table
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}

//@Field exposes to graphql

//Why Many-to-One ? Single user can create multiple posts
