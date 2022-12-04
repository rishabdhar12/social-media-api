import { User } from "../../entities/User";
import { Query, Arg, Mutation } from "type-graphql";

export class UserResolver {
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
    if (user.isAdmin === true) {
      await User.delete({ id });
      return true;
    } else {
      return false;
    }
  }

  // get all users
  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return await User.find();
  }

  // find user by username
  @Query(() => User, { nullable: true })
  async findUserByUsername(
    @Arg("username") username: string
  ): Promise<User | null> {
    return await User.findOne({ where: { username } });
  }
}
