import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text", unique: true }) //username is unique
  username!: string;

  @Field()
  @Property({ type: "text", unique: true }) //username is unique
  email!: string;

  @Property({ type: "text" }) //not exposed    we will hash this and store
  password!: string;
}

//@Field exposes to graphql
//will alter post table to make this
