import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType() //using this we have converted this class to graphql type..also Field and you can set types like Int
@Entity()
export class Post {
  @Field(() => Int) //Corresponds to Column in Table
  @PrimaryKey()
  id!: number;

  @Field(() => String) //Corresponds to Column in Table
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;
}

//@Field exposes to graphql
