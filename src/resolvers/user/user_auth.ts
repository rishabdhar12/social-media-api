import { Arg, Mutation, Resolver, Query } from "type-graphql";
import { User } from "../../entities/User";
import argon2 from "argon2";
import Redis from "ioredis";
const redis = new Redis();

@Resolver()
export class UserAuthResolver {
  // me query
  @Query(() => User, { nullable: true })
  async me(): Promise<User | null> {
    const userId = await redis.get("login");
    if (userId === null) {
      return null;
    }
    return await User.findOne({ where: { id: parseInt(userId) } });
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

  // logout
  @Mutation(() => Boolean)
  async logout(): Promise<Boolean> {
    await redis.del("login");
    return true;
  }

  // change password
  @Mutation(() => User)
  async changePassword(
    @Arg("oldPassword") oldPassword: string,
    @Arg("newPassword") newPassword: string
  ): Promise<User | undefined> {
    const userId = await redis.get("login");
    if (userId === null) {
      throw new Error("You are not logged in");
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const valid = await argon2.verify(user.password, oldPassword);
    if (!valid) {
      throw new Error("Incorrect password");
    }
    const hashedPassword = await argon2.hash(newPassword);
    await User.update({ id: parseInt(userId) }, { password: hashedPassword });
    return user;
  }
}

// forgot password (not implemented)
// login with mobile number and otp (not implemented)
