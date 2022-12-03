import { Arg, Mutation, Resolver, Query } from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import Redis from "ioredis";
const redis = new Redis();

@Resolver()
export class UserResolver {
  // me query
  @Query(() => User, { nullable: true })
  async me(): Promise<User | null> {
    const userId = await redis.get("login");
    if (userId === null) {
      return null;
    }
    return await User.findOne({ where: { id: parseInt(userId) } });
  }

  @Query(() => User, { nullable: true })
  async findUserByUsername(
    @Arg("username") username: string
  ): Promise<User | null> {
    return await User.findOne({ where: { username } });
  }

  // registration
  @Mutation(() => User)
  async register(
    @Arg("name") name: string,
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<User | undefined> {
    if (name === "" && username === "" && email === "" && password === "") {
      throw new Error("Please fill in all fields");
    }
    const exists = await User.findOne({ where: { username } });
    if (exists) {
      throw new Error("Username already exists");
    } else {
      const hashedPassword = await argon2.hash(password);
      const user = User.create({
        name,
        username,
        email,
        password: hashedPassword,
        following: [],
        followers: [],
        friends: [],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        blocked: [],
      });
      return user.save();
    }
  }

  // login
  @Mutation(() => User)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string
  ): Promise<User | undefined> {
    if (username !== "" && password !== "") {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new Error("User does not exist");
      }
      const valid = await argon2.verify(user.password, password);
      if (!valid) {
        throw new Error("Incorrect password");
      }
      await redis.set("login", user.id!.toString());
      // console.log(await redis.get("login"));
      return user;
    } else {
      throw new Error("Please fill in all fields");
    }
  }

  // get user by id
  @Query(() => User, { nullable: true })
  async getUserById(@Arg("id") id: number): Promise<User | null> {
    if (id === null) {
      throw new Error("Enter a valid id");
    }

    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new Error("User does not exist");
    } else {
      return user;
    }
  }

  // update user
  @Mutation(() => User)
  async updateUser(
    @Arg("id") id: number,
    @Arg("name") name: string
  ): Promise<User | undefined> {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new Error("User does not exist");
    }
    await User.update({ id }, { name });
    return user;
  }

  // delete user only if admin
  @Mutation(() => Boolean)
  async deleteUser(@Arg("id") id: number): Promise<Boolean> {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new Error("User does not exist");
    }
    // if (id.toString() === (await redis.get("login"))) {
    //   throw new Error("You cannot delete your own account");
    // }
    if (user.isAdmin === true) {
      await User.delete({ id });
      return true;
    } else {
      return false;
      // throw new Error("You are not an admin");
    }
  }

  // get all users
  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return await User.find();
  }

  // logout
  @Mutation(() => Boolean)
  async logout(): Promise<Boolean> {
    await redis.del("login");
    return true;
  }
}
