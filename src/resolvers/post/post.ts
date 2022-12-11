import { Post } from "../../entities/Post";
import { Mutation, Arg, Query } from "type-graphql";
import Redis from "ioredis";
import { User } from "../../entities/User";
import { Comment } from "../../entities/Comment";
import { In } from "typeorm";
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

    post.postStatus = "deleted";

    // await Post.delete({ id });
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
  @Mutation(() => Post, { nullable: true })
  async changePostStatus(
    @Arg("id") id: number,
    @Arg("creatorId") creatorId: string,
    @Arg("status") postStatus: string
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

  @Mutation(() => Post, { nullable: true })
  async changePostVisibility(
    // change post visibility
    @Arg("id") id: number,
    @Arg("creatorId") creatorId: string,
    @Arg("status") visibility: string
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
  @Mutation(() => Post, { nullable: true })
  async addHashTags(
    @Arg("id") id: number,
    @Arg("creatorId") creatorId: string,
    @Arg("hashTags", () => [String]) hashTags: string[]
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

    for (let i = 0; i < hashTags.length; i++) {
      if (!hashTags[i].startsWith("#")) {
        hashTags[i] = `#${hashTags[i]}`;
      }
    }

    post.hashTags = hashTags;

    return await post.save();
  }

  // post feed
  @Query(() => Post, { nullable: true })
  async feed(): Promise<Post | null> {
    const userId = await redis.get("login");
    console.log(userId);
    if (userId === null) {
      return null;
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    // show posts of friends
    const posts = await Post.find({ where: { creatorId: In(user.friends!) } });
    return posts[0];
  }

  // view single post
  @Query(() => Post, { nullable: true })
  async post(@Arg("postId") postId: number): Promise<Post | null> {
    const userId = await redis.get("login");
    if (!userId) {
      return null;
    }
    const user = await User.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  }

  // view posts of user
  @Query(() => Post, { nullable: true })
  async userPost(@Arg("creatorId") creatorId: number): Promise<Post | null> {
    const userId = await redis.get("login");
    if (!userId) {
      return null;
    }
    const user = await User.findOne({ where: { id: creatorId } });
    if (!user) {
      throw new Error("User does not exist");
    }

    if (user.friends?.includes(userId)) {
      const posts = await Post.find({
        where: { creatorId: In(user.friends!) },
      });
      return posts[0];
    } else {
      const posts = await Post.find({ where: { visibility: "public" } });
      return posts[0];
    }
  }

  // report post
  @Mutation(() => Post, { nullable: true })
  async reportPost(
    @Arg("postId") postId: number,
    @Arg("creatorId") creatorId: number
    // @Arg("reportedBy", () => [String]) reportedBy: string[],
  ): Promise<Post | undefined> {
    const userId = await redis.get("login");
    if (!userId) {
      return undefined;
    }
    const user = await User.findOne({ where: { id: creatorId } });
    if (!user) {
      throw new Error("User does not exist");
    }

    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      throw new Error("Post not found!");
    }

    if (post.reportedBy?.includes(userId)) {
      throw new Error("Already reported");
    }

    post.postStatus = "reported";
    post.reportedBy?.push(userId);

    return await post.save();
  }

  // comment on post
  @Mutation(() => Post, { nullable: true })
  async comment(
    @Arg("postId") postId: number,
    @Arg("creatorId") creatorId: number,
    @Arg("comment") comment: string
  ): Promise<Post | null> {
    const userId = await redis.get("login");
    if (!userId) {
      return null;
    }
    const user = await User.findOne({ where: { id: creatorId } });
    if (!user) {
      throw new Error("User does not exist");
    }

    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error("Post not found");
    }

    // create comment
    const newComment = await Comment.create({
      title: comment,
      post: post,
      isEdited: false,
    }).save();

    post.comment = newComment;
    await post.save();
    
    return post;
  }
}
