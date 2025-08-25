#!/usr/bin/env node

async function main() {
  const baseUrl = process.env.PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.error("PUBLIC_BASE_URL is required to submit sitemap.");
    process.exit(1);
  }

  const sitemapUrl = `${baseUrl.replace(/\/$/, "")}/sitemap.xml`;
  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  for (const url of targets) {
    try {
      const res = await fetch(url, { method: "GET" });
      console.log(`${url} -> ${res.status}`);
    } catch (err) {
      console.error(`${url} -> request failed`, err);
    }
  }
}

main();

