import { Post } from "../entities/Post";
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";
import { MyContext } from "src/types";
@Resolver()
export class PostResolver {
  @Query(() => [Post]) //get all posts (array of posts)
  posts(@Ctx() ctx: MyContext): Promise<Post[]> {
    return ctx.em.find(Post, {});
  }

  @Query(() => Post, { nullable: true }) //get single post by id  ...return value is a Post or a null
  post(
    @Arg("id", () => Int) id: number, //take argument  typescript type and graphql type
    @Ctx() ctx: MyContext
  ): Promise<Post | null> {
    //returning a promise of Post or null
    return ctx.em.findOne(Post, { id });
  }

  @Mutation(() => Post) //creating a post Query for getting data mutation is for updating inseting deleting
  async createPost(
    @Arg("title", () => String) title: string,
    @Ctx() ctx: MyContext
  ): Promise<Post | null> {
    const post = ctx.em.create(Post, {
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await ctx.em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true }) //updating a post title based on id
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() ctx: MyContext
  ): Promise<Post | null> {
    const post = await ctx.em.findOne(Post, { id });
    if (!post) {
      return post;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await ctx.em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean) //deleting a post based on id
  async deletePost(
    @Arg("id") id: number,
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    await ctx.em.nativeDelete(Post, { id });
    return true;
  }
}
