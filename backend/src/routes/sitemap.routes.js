const express = require("express");
const Product  = require("../../models/Product.model");
const Service  = require("../../models/Service.model");
const Blog     = require("../../models/Blog.model");

const router = express.Router();

const BASE_URL = process.env.SITE_URL || "https://www.iscev.com.tr";

const url = (path, changefreq, priority, lastmod = null) => {
  const lastmodTag = lastmod
    ? `\n    <lastmod>${new Date(lastmod).toISOString().split("T")[0]}</lastmod>`
    : "";
  return `
  <url>
    <loc>${BASE_URL}${path}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
};

/**
 * GET /sitemap.xml
 * Statik sayfalar + dinamik ürün/hizmet/blog URL'lerini birleştirir.
 */
router.get("/sitemap.xml", async (req, res) => {
  try {
    const [products, services, blogs] = await Promise.all([
      Product.find({ isActive: true, isDeleted: false }).select("slug updatedAt").lean(),
      Service.find({ isActive: true }).select("slug updatedAt").lean(),
      Blog.find({ status: "published", isDeleted: false }).select("slug publishedAt").lean(),
    ]);

    const staticPages = [
      url("/",           "weekly",  "1.0"),
      url("/kurumsal",   "monthly", "0.8"),
      url("/urunler",    "weekly",  "0.9"),
      url("/hizmetler",  "weekly",  "0.9"),
      url("/kataloglar", "monthly", "0.7"),
      url("/referanslar","monthly", "0.7"),
      url("/harita",     "monthly", "0.6"),
      url("/blog",       "daily",   "0.8"),
      url("/iletisim",   "yearly",  "0.7"),
    ];

    const productUrls = products
      .filter((p) => p.slug)
      .map((p) => url(`/urunler/${p.slug}`, "monthly", "0.8", p.updatedAt));

    const serviceUrls = services
      .filter((s) => s.slug)
      .map((s) => url(`/hizmetler/${s.slug}`, "monthly", "0.7", s.updatedAt));

    const blogUrls = blogs
      .filter((b) => b.slug)
      .map((b) => url(`/blog/${b.slug}`, "monthly", "0.7", b.publishedAt || b.updatedAt));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${
  [...staticPages, ...productUrls, ...serviceUrls, ...blogUrls].join("")
}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600"); // 1 saat cache
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send("<?xml version=\"1.0\"?><error>Sitemap oluşturulamadı.</error>");
  }
});

module.exports = router;
