import { MyContext } from "../types";
import { Post } from "../entities/Post";
import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Int,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post]) //get all posts (array of posts)
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true }) //get single post by id  ...return value is a Post or a null
  post(
    @Arg("id", () => Int) id: number //take argument  typescript type and graphql type
  ): Promise<Post | null> {
    //returning a promise of Post or null
    return Post.findOne({ where: { id } });
  }

  @Mutation(() => Post) //creating a post Query for getting data mutation is for updating inseting deleting
  @UseMiddleware(isAuth) //middleware to check if the user is authenticated or not
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    //if (!req.session.userId) {
    //throw new Error("Not authenticated");
    //} //Instead lets create a middleware that will check if the user is authenticated or not .

    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
    // 2 sql queries one to insert it and another to select it
  }

  @Mutation(() => Post, { nullable: true }) //updating a post title based on id
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    //1 sql query to fetch the post and another to update it
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean) //deleting a post based on id
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
