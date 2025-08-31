import { Response } from "express";
import fs from "fs/promises";
import { ExtendedRequest } from "../types/extended-request";
import z from "zod";
import {
  createPost,
  createPostSlug,
  deletePost,
  getAllPosts,
  getPostBySlug,
  handleCover,
  updatePost,
} from "../services/post";
import { getUserById } from "../services/user";
import { coverToUrl } from "../utils/cover-to-url";

export const addPost = async (req: ExtendedRequest, res: Response) => {
  if (!req.user) return;

  const schema = z.object({
    title: z.string(),
    body: z.string(),
    tags: z.string(),
  });
  const data = schema.safeParse(req.body);
  if (!data.success) {
    const error = z.treeifyError(data.error);
    return res.status(400).json({ error });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file attached." });
  }

  const coverName = await handleCover(req.file);
  if (!coverName) {
    return res.status(400).json({ error: "File not allowed." });
  }

  const slug = await createPostSlug(data.data.title);

  const newPost = await createPost({
    authorId: req.user.id,
    slug,
    title: data.data.title,
    body: data.data.body,
    tags: data.data.tags,
    cover: coverName,
  });

  const author = await getUserById(newPost.authorId);

  res.status(201).json({
    post: {
      id: newPost.id,
      slug: newPost.slug,
      title: newPost.title,
      createdAt: newPost.createdAt,
      cover: coverToUrl(newPost.cover),
      tags: newPost.tags,
      authorName: author?.name,
    },
  });
};

export const getPosts = async (req: ExtendedRequest, res: Response) => {
  let page = 1;
  if (req.query.page) {
    page = parseInt(req.query.page as string);
    if (page <= 0) {
      return res.status(400).json({ error: "This page does not exist." });
    }
  }

  let posts = await getAllPosts(page);

  const postsToReturn = posts.map((post) => ({
    id: post.id,
    status: post.status,
    title: post.title,
    createdAt: post.createdAt,
    cover: coverToUrl(post.cover),
    authorName: post.author?.name,
    tags: post.tags,
    slug: post.slug,
  }));

  res.json({ posts: postsToReturn, page });
};

export const getPost = async (req: ExtendedRequest, res: Response) => {
  const { slug } = req.params;

  const post = await getPostBySlug(slug);
  if (!post) {
    return res.status(400).json({ error: `Post '${slug}' does not exist.` });
  }

  res.json({
    post: {
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
      cover: coverToUrl(post.cover),
      authorName: post.author?.name,
      body: post.body,
      tags: post.tags,
      slug: post.slug,
    },
  });
};

export const editPost = async (req: ExtendedRequest, res: Response) => {
  const { slug } = req.params;

  const schema = z.object({
    status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    tags: z.string().optional(),
  });
  const data = schema.safeParse(req.body);
  if (!data.success) {
    const error = z.treeifyError(data.error);
    return res.status(400).json({ error });
  }

  const post = await getPostBySlug(slug);
  if (!post) {
    return res.status(400).json({ error: `Post '${slug}' does not exist.` });
  }

  let coverName: string | false = false;
  if (req.file) {
    coverName = await handleCover(req.file);
  }

  const updatedPost = await updatePost(slug, {
    updatedAt: new Date(),
    status: data.data.status ?? undefined,
    title: data.data.title ?? undefined,
    body: data.data.body ?? undefined,
    tags: data.data.tags ?? undefined,
    cover: coverName ? coverName : undefined,
  });

  const author = await getUserById(updatedPost.authorId);

  res.json({
    post: {
      id: updatedPost.id,
      status: updatedPost.status,
      slug: updatedPost.slug,
      title: updatedPost.title,
      createdAt: updatedPost.createdAt,
      cover: coverToUrl(updatedPost.cover),
      tags: updatedPost.tags,
      authorName: author?.name,
    },
  });
};

export const removePost = async (req: ExtendedRequest, res: Response) => {
  const { slug } = req.params;

  const post = await getPostBySlug(slug);
  if (!post) {
    return res.status(400).json({ error: `Post '${slug}' does not exist.` });
  }

  await deletePost(post.slug);

  if (post.cover) {
    try {
      await fs.unlink(`./public/images/covers/${post.cover}`);
    } catch {}
  }

  res.status(204).json();
};
