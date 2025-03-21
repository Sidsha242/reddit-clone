import { User } from "../entities/User";
import { MyContext } from "../types";
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
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { FORGET_PASSWORD_PREFIX } from "../constants";
import { conn } from "../index";

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
    @Ctx() { redis, req }: MyContext
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

    const userIdNum = parseInt(userId);

    const user = await User.findOne({ where: { id: userIdNum } }); //find user by id

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

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    ); //update password

    await redis.del(key); //delete token from redis

    //log in user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } }); //find email in database
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
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      //if not logged in
      return null;
    }

    return User.findOne({ where: { id: req.session.userId } }); //find user by id
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    //not tied to shape of response

    const hashedPassword = await argon2.hash(options.password); //hashing password

    let user;
    try {
      //User.create({}).save()
      const result = await conn
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      //console.log(result);
      user = result.raw[0];
    } catch (err) {
      //while creating if error ..username already exists
      console.log("message", err.message);
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@") //conditionally finding if login by username or email
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
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
