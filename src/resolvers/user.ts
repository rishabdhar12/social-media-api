import { User } from "../entities/User";
import { Query, Arg, Mutation } from "type-graphql";
import Redis from "ioredis";
const redis = new Redis();

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
    // if (id.toString() === (await redis.get("login"))) {
    // throw new Error("You cannot delete your own account");
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

  // find user by username
  @Query(() => User, { nullable: true })
  async findUserByUsername(
    @Arg("username") username: string
  ): Promise<User | null> {
    return await User.findOne({ where: { username } });
  }

  // follow user
  @Mutation(() => User)
  async followUser(@Arg("id") id: number): Promise<User | undefined> {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const userId = await redis.get("login");
    if (userId === null) {
      throw new Error("You are not logged in");
    }
    const currentUser = await User.findOne({ where: { id: parseInt(userId) } });
    if (!currentUser) {
      throw new Error("User does not exist");
    }
    if (user.blocked?.includes(user.id!.toString())) {
      throw new Error("You are blocked by this user");
    }
    if (user.friendRequestsReceived?.includes(user.id!.toString())) {
      throw new Error("You have a pending friend request from this user");
    }
    if (user.friendRequestsSent?.includes(user.id!.toString())) {
      throw new Error("You have already sent a friend request to this user");
    }
    if (user.friends?.includes(user.id!.toString())) {
      throw new Error("You are already friends with this user");
    }
    if (currentUser.following?.includes(id.toString())) {
      currentUser.following = currentUser.following.filter(
        (followingId) => followingId !== id.toString()
      );
      user.followers = user.followers?.filter(
        (followerId) => followerId !== userId
      );
    } else {
      currentUser.following?.push(id.toString());
      user.followers?.push(userId);
    }
    await User.update({ id }, { followers: user.followers });
    await User.update(
      { id: parseInt(userId) },
      { following: currentUser.following }
    );
    return user;
  }

  // show all following users
  @Query(() => [User], { nullable: true })
  async showFollowingUsers(): Promise<User[]> {
    const userId = await redis.get("login");
    if (userId === null) {
      throw new Error("You are not logged in");
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const following =
      user.following?.map(async (followingId) => {
        return await User.findOne({ where: { id: parseInt(followingId) } });
      }) || [];

    return await Promise.all(following as any);
  }

  // show all followers
  @Query(() => [User], { nullable: true })
  async showFollowers(): Promise<User[]> {
    const userId = await redis.get("login");
    if (userId === null) {
      throw new Error("You are not logged in");
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const followers =
      user.followers?.map(async (followerId) => {
        return await User.findOne({ where: { id: parseInt(followerId) } });
      }) || [];

    return await Promise.all(followers as any);
  }

  // send friendRequest
  @Mutation(() => User)
  async sendFriendRequests(@Arg("id") id: number): Promise<User | null> {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const userId = await redis.get("login");
    if (userId === null) {
      throw new Error("You are not logged in");
    }
    const currentUser = await User.findOne({ where: { id: parseInt(userId) } });
    if (!currentUser) {
      throw new Error("User does not exist");
    }
    if (userId === id.toString()) {
      throw new Error("Cannot request yourself");
    }
    if (user.blocked?.includes(user.id!.toString())) {
      throw new Error("You are blocked by this user");
    }
    if (currentUser.friendRequestsReceived?.includes(user.id!.toString())) {
      throw new Error("You have a pending friend request from this user");
    }
    if (user.friends?.includes(user.id!.toString())) {
      throw new Error("You are already friends with this user");
    }
    if (currentUser.friendRequestsSent?.includes(id.toString())) {
      throw new Error("You are already sent friend request to this user.");
    } else {
      user.friendRequestsReceived?.push(userId.toString());
      currentUser.friendRequestsSent?.push(id.toString());
    }
    await User.update(
      { id },
      { friendRequestsReceived: user.friendRequestsReceived }
    );
    await User.update(
      { id: parseInt(userId) },
      { friendRequestsSent: currentUser.friendRequestsSent }
    );
    return user;
  }

  // show friend request sent list
  @Query(() => [User], { nullable: true })
  async showFriendRequestsSent(): Promise<User[]> {
    const userId = await redis.get("login");
    if (userId === null) {
      throw new Error("You aren't logged in");
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const friendRequestsSent =
      user.friendRequestsSent?.map(async (friendRequestId) => {
        return await User.findOne({ where: { id: parseInt(friendRequestId) } });
      }) || [];

    return await Promise.all(friendRequestsSent as any);
  }

  // show friend request received list
  @Query(() => [User], { nullable: true })
  async showFriendRequestsReceived(): Promise<User[]> {
    const userId = await redis.get("login");
    if (userId === null) {
      throw new Error("You aren't logged in");
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const friendRequestsReceived =
      user.friendRequestsReceived?.map(async (friendRequestsReceivedId) => {
        return await User.findOne({
          where: { id: parseInt(friendRequestsReceivedId) },
        });
      }) || [];

    return await Promise.all(friendRequestsReceived as any);
  }

  // TODO: friend request accept and friends count
}
