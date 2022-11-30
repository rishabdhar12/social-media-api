import { Arg, Mutation, Resolver, Query } from "type-graphql";
import { User } from "../entities/User";

@Resolver()
export class UserResolver {
  // query to find user by username typeorm
  @Query(() => User, { nullable: true })
  async findUserByUsername(
    @Arg("username") username: string
  ): Promise<User | null> {
    return await User.findOne({ where: { username } });
  }

  @Mutation(() => User)
  async register(
    @Arg("name") name: string,
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<User | undefined> {
    const exists = await User.findOne({ where: { username } });
    if (exists) {
      throw new Error("Username already exists");
    } else {
      return await User.create({
        name,
        username,
        email,
        password,
        following: [],
        followers: [],
        friends: [],
        friendRequestsSent: [],
        friendRequestsReceived: [],
        blocked: [],
      }).save();
    }
  }
}
