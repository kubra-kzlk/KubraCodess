// src/lib/contentful.js
import { createClient } from 'contentful';

const client = createClient({
  space: import.meta.env.PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.PUBLIC_CONTENTFUL_ACCESS_TOKEN,
});

export async function fetchBlogPosts() {
   const entries = await client.getEntries({ content_type: "pageBlogPost" });

  return entries.items.map((item) => ({
    id: item.sys.id,
    title: item.fields.title,
    slug: item.fields.slug,
    author: item.fields.author?.fields?.name || "Unknown",
    publishedDate: item.fields.publishedDate || null,
    subtitle: item.fields.shortDescription || "",
    heroImage: item.fields.featuredImage?.fields?.file?.url || "",
    content: item.fields.content,
  }));
}

export async function fetchBlogPostBySlug(slug) {
  const entries = await client.getEntries({
    content_type: 'pageBlogPost',
    'fields.slug': slug,
  });
  return entries.items[0];
}

//console.log("Contentful Response:", JSON.stringify(response, null, 2)); // ✅ Debugging step

