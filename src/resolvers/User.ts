import { Arg, Mutation, Resolver, Query } from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
@Resolver()
export class UserResolver {
  // query to find user by username typeorm
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
      return await User.create({
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
      }).save();
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
      return user;
    } else {
      throw new Error("Please fill in all fields");
    }
  }

  // get user by id
  @Query(() => User, { nullable: true })
  async getUserById(@Arg("id") id: number): Promise<User | null> {
    if (id === null) {
      throw new Error("User does not exist");
    }
    return await User.findOne({ where: { id } });
  }
}
