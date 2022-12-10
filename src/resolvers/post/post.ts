import { Post } from "../../entities/Post";
import { Mutation, Arg } from "type-graphql";
import Redis from "ioredis";
import { User } from "../../entities/User";
const redis = new Redis();

export class PostResolver {
  // create post
  @Mutation(() => Post, { nullable: true })
  async createPost(
    @Arg("title") title: string,
    @Arg("description") description: string
  ): Promise<Post | undefined> {
    const userId = await redis.get("login");
    if (userId === null) {
      return undefined;
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const post = Post.create({
      title,
      description,
      creatorId: user,
      totalLikes: 0,
      totalComments: 0,
      postStatus: "active",
      visibility: "public",
      taggedUsers: [],
      hashTags: [],
    });
    return await post.save();
  }

  // update post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("creatorId") creatorId: string,
    @Arg("description") description: string
  ): Promise<Post | undefined> {
    const userId = await redis.get("login");
    console.log(userId);
    if (userId === null) {
      return undefined;
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const post = await Post.findOne({ where: { id: id } });
    if (!post) {
      throw new Error("Post does not exist");
    }
    if (userId !== creatorId) {
      throw new Error("You are not the creator of this post");
    }
    // post.title = title;
    post.description = description;
    return await post.save();
  }

  // delete post
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Arg("creatorId") creatorId: string
  ): Promise<Boolean> {
    const userId = await redis.get("login");
    console.log(userId);
    if (userId === null) {
      return false;
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const post = await Post.findOne({ where: { id: id } });
    if (!post) {
      throw new Error("Post does not exist");
    }
    if (userId !== creatorId) {
      throw new Error("You are not the creator of this post");
    }

    await Post.delete({ id });
    return true;
  }

  // tag users
  @Mutation(() => Post, { nullable: true })
  async tagUsers(
    @Arg("id") id: number,
    @Arg("creatorId") creatorId: string,
    // list of user ids
    @Arg("taggedUsers", () => [String]) taggedUsers: string[]
  ): Promise<Post | undefined> {
    const userId = await redis.get("login");
    console.log(userId);
    if (userId === null) {
      return undefined;
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const post = await Post.findOne({ where: { id: id } });
    if (!post) {
      throw new Error("Post does not exist");
    }
    if (userId !== creatorId) {
      throw new Error("You are not the creator of this post");
    }

    // check if user to be tagged is friends with creator
    for (let i = 0; i < taggedUsers.length; i++) {
      if (!user.friends!.includes(taggedUsers[i])) {
        throw new Error("You can only tag your friends");
      }
    }

    post.taggedUsers = taggedUsers; 
    return await post.save();
  }

  // change post status
  @Mutation(() => Post, {nullable: true})
  async changePostStatus(
    @Arg("id") id: number,
    @Arg("creatorId") creatorId: string,
    @Arg("status") postStatus: string,
  ): Promise<Post | undefined> {
    const userId = await redis.get("login");
    console.log(userId);
    if (userId === null) {
      return undefined;
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const post = await Post.findOne({ where: { id: id } });
    if (!post) {
      throw new Error("Post does not exist");
    }
    if (userId !== creatorId) {
      throw new Error("You are not the creator of this post");
    }

    post.postStatus = postStatus;
    return await post.save();
  }

  // change post visibility
  @Mutation(() => Post, {nullable: true})
  async changePostVisibility(
    @Arg("id") id: number,
    @Arg("creatorId") creatorId: string,
    @Arg("status") visibility: string,
  ): Promise<Post | undefined> {
    const userId = await redis.get("login");
    console.log(userId);
    if (userId === null) {
      return undefined;
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const post = await Post.findOne({ where: { id: id } });
    if (!post) {
      throw new Error("Post does not exist");
    }
    if (userId !== creatorId) {
      throw new Error("You are not the creator of this post");
    }

    post.visibility = visibility;
    return await post.save();
  }

  // add hashTags
  // TODO: tomorrow!
}
