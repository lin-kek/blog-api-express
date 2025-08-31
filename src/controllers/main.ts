import { RequestHandler } from "express";
import {
  getPostBySlug,
  getPublishedPosts,
  getPublishedPostsWithSameTags,
} from "../services/post";
import { coverToUrl } from "../utils/cover-to-url";

export const getAllPosts: RequestHandler = async (req, res) => {
  let page = 1;
  if (req.query.page) {
    page = parseInt(req.query.page as string);
    if (page <= 0) {
      return res.status(400).json({ error: "This page does not exist." });
    }
  }

  let posts = await getPublishedPosts(page);

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

export const getPost: RequestHandler = async (req, res) => {
  const { slug } = req.params;

  const post = await getPostBySlug(slug);
  if (!post || (post && post.status !== "PUBLISHED")) {
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

export const getRelatedPosts: RequestHandler = async (req, res) => {
  let page = 1;
  if (req.query.page) {
    page = parseInt(req.query.page as string);
    if (page <= 0) {
      return res.status(400).json({ error: "This page does not exist." });
    }
  }

  const { slug } = req.params;

  const post = await getPostBySlug(slug);
  if (!post || (post && post.status !== "PUBLISHED")) {
    return res.status(400).json({ error: `Post '${slug}' does not exist.` });
  }

  let posts = await getPublishedPostsWithSameTags(page, slug);

  const postsToReturn = posts.map((post) => ({
    id: post.id,
    title: post.title,
    createdAt: post.createdAt,
    cover: coverToUrl(post.cover),
    authorName: post.author?.name,
    tags: post.tags,
    slug: post.slug,
  }));

  res.json({ posts: postsToReturn, page });
};
