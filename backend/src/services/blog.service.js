const Blog = require('../../models/Blog.model');
const { deleteFile } = require('../utils/fileHelper');

const createError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

/**
 * tags alanı; JSON dizisi string'i ("["a","b"]") veya
 * virgülle ayrılmış string ("a, b, c") olarak gelebilir.
 */
const parseTags = (tags) => {
  if (!tags) return undefined;
  if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed.map((t) => t.trim()).filter(Boolean) : undefined;
  } catch {
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
};

const getAllBlogs = async ({ status, tag, page = 1, limit = 10 } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (tag) filter.tags = tag; // tek tag eşleşmesi (array field)

  const skip = (Number(page) - 1) * Number(limit);

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .select('-content') // listede ağır içerik gönderme
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Blog.countDocuments(filter),
  ]);

  return { blogs, total, page: Number(page), limit: Number(limit) };
};

/**
 * Slug veya MongoDB ObjectId ile blog getirir.
 * Aynı anda ikisini de destekler — route tek endpoint kullanabilir.
 */
const getBlogBySlugOrId = async (identifier) => {
  const mongoose = require('mongoose');
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier) && identifier.length === 24;
  const blog = isObjectId
    ? await Blog.findById(identifier)
    : await Blog.findOne({ slug: identifier });

  if (!blog) throw createError('Blog yazısı bulunamadı.', 404, 'NOT_FOUND');

  // Görüntülenme sayacını arka planda artır (await etmiyoruz — response'u bloklamaz)
  Blog.findByIdAndUpdate(blog._id, { $inc: { viewCount: 1 } }).exec();

  return blog;
};

const createBlog = async (data) => {
  const {
    title, content, excerpt, author, coverImagePath,
    tags, status, metaTitle, metaDescription,
  } = data;

  return Blog.create({
    title,
    content,
    excerpt,
    author,
    coverImagePath,
    tags: parseTags(tags) ?? [],
    status: status || 'draft',
    metaTitle,
    metaDescription,
    // publishedAt: pre-save hook status==='published' olduğunda otomatik set eder
  });
};

const updateBlog = async (id, updates, newCoverImagePath) => {
  const blog = await Blog.findById(id);
  if (!blog) throw createError('Blog yazısı bulunamadı.', 404, 'NOT_FOUND');

  const {
    title, content, excerpt, author,
    tags, status, metaTitle, metaDescription,
  } = updates;

  if (title !== undefined) blog.title = title;
  if (content !== undefined) blog.content = content;
  if (excerpt !== undefined) blog.excerpt = excerpt;
  if (author !== undefined) blog.author = author;
  if (status !== undefined) blog.status = status;
  if (metaTitle !== undefined) blog.metaTitle = metaTitle;
  if (metaDescription !== undefined) blog.metaDescription = metaDescription;

  const parsedTags = parseTags(tags);
  if (parsedTags !== undefined) blog.tags = parsedTags;

  if (newCoverImagePath) {
    await deleteFile(blog.coverImagePath);
    blog.coverImagePath = newCoverImagePath;
  }

  // publishedAt — pre-save hook status 'published' olduğunda otomatik tetiklenir
  await blog.save();
  return blog;
};

const deleteBlog = async (id) => {
  const blog = await Blog.findById(id);
  if (!blog) throw createError('Blog yazısı bulunamadı.', 404, 'NOT_FOUND');

  await deleteFile(blog.coverImagePath);
  await blog.deleteOne();
};

module.exports = {
  getAllBlogs,
  getBlogBySlugOrId,
  createBlog,
  updateBlog,
  deleteBlog,
};
