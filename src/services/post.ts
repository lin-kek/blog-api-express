import { v4 } from "uuid";
import sharp from "sharp";
import fs from "fs/promises";
import slug from "slug";
import { prisma } from "../libs/prisma";
import { Prisma } from "@prisma/client";

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png"];
const MAX_W = 1200;
const MAX_H = 1200;
const MIN_W = 600;
const MIN_H = 400;

export async function handleCover(file: Express.Multer.File) {
  // Validate type
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    try {
      await fs.unlink(file.path);
    } catch {}
    return false;
  }

  const meta = await sharp(file.path).metadata();

  // Validate size
  const invalidSize =
    !meta.width ||
    !meta.height ||
    meta.width < MIN_W ||
    meta.height < MIN_H ||
    meta.width > MAX_W ||
    meta.height > MAX_H;
  if (invalidSize) {
    try {
      await fs.unlink(file.path);
    } catch {}
    return false;
  }

  const coverName = `${v4()}.webp`;
  const outPath = `./public/images/covers/${coverName}`;

  await sharp(file.path).webp({ quality: 85 }).toFile(outPath);

  try {
    await fs.unlink(file.path);
  } catch {}

  return coverName;
}

export async function createPostSlug(title: string) {
  let newSlug = slug(title);
  let keepTrying = true;
  let postCount = 1;

  while (keepTrying) {
    const post = await getPostBySlug(newSlug);

    if (!post) {
      keepTrying = false;
    } else {
      newSlug = slug(`${title} ${++postCount}`);
    }
  }

  return newSlug;
}

export async function getPostBySlug(slug: string) {
  return await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });
}

type CreatePostProps = {
  authorId: number;
  slug: string;
  title: string;
  body: string;
  tags: string;
  cover: string;
};

export async function createPost(data: CreatePostProps) {
  return await prisma.post.create({ data });
}

export async function updatePost(slug: string, data: Prisma.PostUpdateInput) {
  return await prisma.post.update({
    where: { slug },
    data,
  });
}

export async function deletePost(slug: string) {
  return await prisma.post.delete({
    where: { slug },
  });
}

export async function getAllPosts(page: number) {
  let itemsPerPage = 5;

  if (page <= 0) return [];

  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: itemsPerPage,
    skip: (page - 1) * itemsPerPage,
  });

  return posts;
}

export async function getPublishedPosts(page: number) {
  let itemsPerPage = 5;

  if (page <= 0) return [];

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: itemsPerPage,
    skip: (page - 1) * itemsPerPage,
  });

  return posts;
}

export async function getPublishedPostsWithSameTags(
  page: number,
  slug: string
) {
  let itemsPerPage = 5;

  if (page <= 0) return [];

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return [];

  const tags = post.tags.split(",");
  if (tags.length === 0) return [];

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      slug: { not: slug },
      OR: tags.map((tag) => ({
        tags: { contains: tag, mode: "insensitive" },
      })),
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: itemsPerPage,
    skip: (page - 1) * itemsPerPage,
  });

  return posts;
}
