const express = require('express');
const router = express.Router();

/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml based on the current host
 */
router.get('/sitemap.xml', (req, res) => {
    const protocol = req.protocol; // http or https
    const host = req.get('host'); // domain name
    const baseUrl = `${protocol}://${host}`;

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
});

module.exports = router;
