// src/lib/contentful.js

import { createClient } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

const client = createClient({
  space: import.meta.env.PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.PUBLIC_CONTENTFUL_ACCESS_TOKEN,
});

export async function fetchBlogPosts() {
  const entries = await client.getEntries({ content_type: 'pageBlogPost' });

  return entries.items.map((item) => ({
    id: item.sys.id,
    title: item.fields.title,
    slug: item.fields.slug,
    subtitle: item.fields.subtitle || '',
    publishedDate: item.fields.publishedDate || null,
    featuredImage: item.fields.featuredImage?.fields?.file?.url ? `https:${item.fields.featuredImage.fields.file.url}` : '',
    author: item.fields.author?.fields?.name || 'Unknown',
  }));
}

export async function fetchBlogPostBySlug(slug) {
  const entries = await client.getEntries({
    content_type: 'pageBlogPost',
    'fields.slug': slug,
    include: 2, // To include linked entries (e.g., author, related posts, SEO fields)
  });

  if (!entries.items.length) return null;

  const item = entries.items[0];

  console.log('🔍 Contentful Response:', JSON.stringify(item.fields.content, null, 2));

  let convertedContent = '';

  try {
    convertedContent = documentToHtmlString(item.fields.content);
  } catch (error) {
    console.error('Error converting Rich Text to HTML:', error);
  }

  return {
    internalName: item.fields.internalName || 'Untitled',
    slug: item.fields.slug,
    title: item.fields.title,
    shortDescription: item.fields.shortDescription || '',
    featuredImage: item.fields.featuredImage?.fields?.file?.url ? `https:${item.fields.featuredImage.fields.file.url}` : '',
    publishedDate: item.fields.publishedDate || null,
    author: item.fields.author?.fields?.name || 'Unknown',
    seoFields: item.fields.seoFields || null,
    content: convertedContent,
    relatedBlogPosts:
      item.fields.relatedBlogPosts?.map((post) => ({
        title: post.fields.title,
        slug: post.fields.slug,
      })) || [],
  };
}
