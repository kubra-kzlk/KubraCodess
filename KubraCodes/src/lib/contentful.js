import { createClient } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import pkg from 'contentful-management';
const { createClient: createManagementClient } = pkg;

const client = createClient({
  space: import.meta.env.PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.PUBLIC_CONTENTFUL_ACCESS_TOKEN,
});

const managementClient = createManagementClient({
  accessToken: import.meta.env.PUBLIC_CONTENTFUL_MANAGEMENT_TOKEN,
});

export async function fetchLandingPage() {
  const entries = await client.getEntries({
    content_type: 'pageLanding', // Content type ID for the landing page
    include: 2, // Include linked entries ( seoFields, featuredBlogPost)
  });

  if (!entries.items.length) return null;

  const item = entries.items[0];
  return {
    internalName: item.fields.internalName || 'Landing Page',
    seoFields: item.fields.seoFields?.fields || null, // Include SEO fields
    featuredBlogPost: item.fields.featuredBlogPost?.fields || null, 
  };
}

export async function fetchBlogPosts() {
  const entries = await client.getEntries({ content_type: 'pageBlogPost' });

  // Fetch tags for each entry using the Management API
  const postsWithTags = await Promise.all(
    entries.items.map(async (item) => {
      const entryId = item.sys.id;
      const tags = await fetchTagsForEntry(entryId);

      return {
        id: item.sys.id,
        title: item.fields.title,
        slug: item.fields.slug,
        subtitle: item.fields.subtitle || '',
        publishedDate: item.fields.publishedDate || null,
        featuredImage: item.fields.featuredImage?.fields?.file?.url
          ? `https:${item.fields.featuredImage.fields.file.url}`
          : '',
        author: item.fields.author?.fields?.name || 'Unknown',
        tags: tags, // Add tags to the post
      };
    })
  );

  return postsWithTags;
}

async function fetchTagsForEntry(entryId) {
  try {
    const space = await managementClient.getSpace(import.meta.env.PUBLIC_CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment('master');
    const entry = await environment.getEntry(entryId);

    // Extract tags from the entry metadata
    const tags = entry.metadata?.tags || [];
    return tags.map((tag) => tag.sys.id);
  } catch (error) {
    console.error('Error fetching tags for entry:', error);
    return [];
  }
}

export async function fetchBlogPostBySlug(slug) {
  const entries = await client.getEntries({
    content_type: 'pageBlogPost',
    'fields.slug': slug,
    include: 2, // To include linked entries ( author, related posts, SEO fields)
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
