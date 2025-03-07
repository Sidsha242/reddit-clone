import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
  Arg,
  Mutation,
  Resolver,
  Field,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql"; //for writing queries
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { FORGET_PASSWORD_PREFIX } from "../constants";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType() //Graphql type that we can return from a resolver
class UserResponse {
  //response for login could be an error or the user
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]; //? means undefined

  @Field(() => User, { nullable: true })
  user?: User;
}

//Whenever we need database access use em from context

@Resolver() //Resolver is a class that has a bunch of methods that can be queried or mutated
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { em, redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key); //get user id from redis
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const user = await em.findOne(User, { id: parseInt(userId) }); //find user by id
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    user.password = await argon2.hash(newPassword); //hashing new password

    await em.persistAndFlush(user); //save to db

    await redis.del(key); //delete token from redis

    //log in user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email }); //find email in database
    if (!user) {
      //email not in db
      return true;
    }

    const token = v4(); //generate token

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "EX",
      1000 * 60 * 60 * 24
    ); //store token in redis..give it a prefix..3 DAYS EXPIRATION

    sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );
    return true;
  }

  //const user = await em.findOne(User
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      //if not logged in
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId }); //find user by id

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    //not tied to shape of response

    const hashedPassword = await argon2.hash(options.password); //hashing password

    //create user object
    // const user = em.create(User, {
    //   username: username,
    //   password: hashedPassword,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // });
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          email: options.email,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*"); //insert into db using Knex  .. * will return user

      //using mikro-orm
      //await em.persistAndFlush(user); //save to db

      user = result[0]; //first user
    } catch (err) {
      //while creating if error ..username already exists
      if (err.code === "23505" || err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }

    //autologin after register
    req.session.userId = user.id;
    return { user }; //response object
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@") //conditionally finding if login by username or email
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    ); //find user by username
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "username does not exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password); //comparing user entered password with hashed password
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "invalid login",
          },
        ],
      };
    }

    req.session.userId = user.id; //setting session id to user id

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        //will destroy express session not cookie
        res.clearCookie("qid"); //clear cookie
        if (err) {
          console.log(err);
          resolve(false);
          return;
        } //destroy is a callback , await promise

        resolve(true);
      })
    );
  }
}
export function InputType(): (
  target: typeof UsernamePasswordInput
) => void | typeof UsernamePasswordInput {
  throw new Error("Function not implemented.");
}
