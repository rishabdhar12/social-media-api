import { User } from "src/entities/User";
import { Mutation, Arg, Query } from "type-graphql";
import Redis from "ioredis";
const redis = new Redis();

export class UserActivityResolver {
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

  // accept friend request
  @Mutation(() => User)
  async acceptFriendRequest(@Arg("id") id: number): Promise<User | null> {
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
    if (user.friends?.includes(user.id!.toString())) {
      throw new Error("You are already friends with this user");
    }
    if (currentUser.friendRequestsSent?.includes(id.toString())) {
      throw new Error("You already sent friend request to this user.");
    }
    if (currentUser.friendRequestsReceived?.includes(id.toString())) {
      const index = currentUser.friendRequestsReceived?.indexOf(id.toString());
      if (index !== undefined) {
        currentUser.friends?.push(id.toString());
        currentUser.friendRequestsReceived?.splice(index, 1);
        currentUser.totalFriends! += 1;
        currentUser.followers?.push(id.toString());
      }
      const index2 = user.friendRequestsSent?.indexOf(userId.toString());
      if (index2 !== undefined) {
        user.friends?.push(userId.toString());
        user.friendRequestsSent?.splice(index2, 1);
        user.totalFriends! += 1;
        user.following?.push(userId.toString());
      }
      await User.update(
        { id },
        {
          friends: user.friends,
          friendRequestsSent: user.friendRequestsSent,
          totalFriends: user.totalFriends,
          following: user.following,
        }
      );
      await User.update(
        { id: parseInt(userId) },
        {
          friends: currentUser.friends,
          friendRequestsReceived: currentUser.friendRequestsReceived,
          totalFriends: currentUser.totalFriends,
          followers: currentUser.followers,
        }
      );
    } else {
      throw new Error("Already accepted request");
    }
    return user;
  }

  // reject friend request
  @Mutation(() => User)
  async rejectFriendRequest(@Arg("id") id: number): Promise<User | null> {
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
    if (currentUser.friendRequestsReceived?.includes(id.toString())) {
      const index = currentUser.friendRequestsReceived?.indexOf(id.toString());
      if (index !== undefined) {
        currentUser.friendRequestsReceived?.splice(index, 1);
        currentUser.followers?.splice(index, 1);
      }
      const index2 = user.friendRequestsSent?.indexOf(userId.toString());
      if (index2 !== undefined) {
        user.friendRequestsSent?.splice(index2, 1);
        user.following?.splice(index2, 1);
      }
      await User.update(
        { id },
        {
          friendRequestsSent: user.friendRequestsSent,
          following: user.following,
        }
      );
      await User.update(
        { id: parseInt(userId) },
        {
          friendRequestsReceived: currentUser.friendRequestsReceived,
          followers: currentUser.followers,
        }
      );
    } else {
      throw new Error("Already accepted request");
    }
    return user;
  }

  // show friends
  @Query(() => [User], { nullable: true })
  async showFriends(): Promise<User[]> {
    const userId = await redis.get("login");
    if (userId === null) {
      throw new Error("You aren't logged in");
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const friends =
      user.friends?.map(async (friend) => {
        return await User.findOne({
          where: { id: parseInt(friend) },
        });
      }) || [];

    return await Promise.all(friends as any);
  }

  // block user
  @Mutation(() => User)
  async blockUser(@Arg("id") id: number) {
    const userId = await redis.get("login");
    if (!userId) {
      throw new Error("You are not logged in");
    }
    const currentUser = await User.findOne({ where: { id: parseInt(userId) } });
    if (!currentUser) {
      throw new Error("User doesn't exist");
    }
    // remove from friend request sent
    if (currentUser.friendRequestsSent?.includes(id.toString())) {
      const index = currentUser.friendRequestsSent?.indexOf(id.toString());
      if (index !== undefined) {
        currentUser.friendRequestsSent?.splice(index, 1);
      }
    }

    // remove from friend request received
    if (currentUser.friendRequestsReceived?.includes(id.toString())) {
      const index = currentUser.friendRequestsReceived?.indexOf(id.toString());
      if (index !== undefined) {
        currentUser.friendRequestsReceived?.splice(index, 1);
      }
    }
    // add to blocked user list
    currentUser.blocked?.push(id.toString());
    await User.update(
      { id: parseInt(userId) },
      {
        friendRequestsReceived: currentUser.friendRequestsReceived,
        friendRequestsSent: currentUser.friendRequestsSent,
        blocked: currentUser.blocked,
        // followers: currentUser.followers,
        // following: currentUser.following,
      }
    );
    return currentUser;
  }

  // unblock user
  @Mutation(() => User)
  async unblockUser(@Arg("id") id: number) {
    const userId = await redis.get("login");
    if (!userId) {
      throw new Error("You are not logged in");
    }
    const currentUser = await User.findOne({ where: { id: parseInt(userId) } });
    if (!currentUser) {
      throw new Error("User doesn't exist");
    }

    // remove from blocked user list
    if (currentUser.blocked?.includes(id.toString())) {
      const index = currentUser.blocked?.indexOf(id.toString());
      if (index !== undefined) {
        currentUser.blocked?.splice(index, 1);
      }
    }
    await User.update(
      { id: parseInt(userId) },
      {
        blocked: currentUser.blocked,
      }
    );
    return currentUser;
  }

  // show blocked user list
  @Query(() => [User], { nullable: true })
  async showBlockedUsers() {
    const userId = await redis.get("login");
    if (userId === null) {
      throw new Error("You aren't logged in");
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User ddoesn't exist");
    }
    const blockedUsers =
      user.blocked?.map(async (blockedId) => {
        return await User.findOne({ where: { id: parseInt(blockedId) } });
      }) || [];
    return Promise.all(blockedUsers as any);
  }

  @Mutation(() => User)
  async muteUser(@Arg("id") id: number) {
    const userId = await redis.get("login");
    if (!userId) {
      throw new Error("You are not logged in");
    }
    const currentUser = await User.findOne({ where: { id: parseInt(userId) } });
    if (!currentUser) {
      throw new Error("User doesn't exist");
    }
    currentUser.muted?.push(id.toString());
    await User.update(
      { id: parseInt(userId) },
      {
        muted: currentUser.muted,
      }
    );
    return currentUser;
  }

  // unmute user
  @Mutation(() => User)
  async unmuteUser(@Arg("id") id: number) {
    const userId = await redis.get("login");
    if (!userId) {
      throw new Error("You are not logged in");
    }
    const currentUser = await User.findOne({ where: { id: parseInt(userId) } });
    if (!currentUser) {
      throw new Error("User doesn't exist");
    }

    // remove from muted user list
    if (currentUser.muted?.includes(id.toString())) {
      const index = currentUser.muted?.indexOf(id.toString());
      if (index !== undefined) {
        currentUser.muted?.splice(index, 1);
      }
    }
    await User.update(
      { id: parseInt(userId) },
      {
        muted: currentUser.muted,
      }
    );
    return currentUser;
  }

  // TODO: Deactivate, Filtering, Searching tomorrow.
}
