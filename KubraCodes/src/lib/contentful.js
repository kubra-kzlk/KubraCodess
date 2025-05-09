import { createClient } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import pkg from 'contentful-management';
import { BLOCKS } from '@contentful/rich-text-types'; //om images in content in te laden
const { createClient: createManagementClient } = pkg;

const client = createClient({
  space: import.meta.env.PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.PUBLIC_CONTENTFUL_ACCESS_TOKEN,
});

console.log("CONTENTFUL_SPACE_ID:", process.env.CONTENTFUL_SPACE_ID);
console.log("CONTENTFUL_ACCESS_TOKEN:", process.env.CONTENTFUL_ACCESS_TOKEN);


const managementClient = createManagementClient({
  accessToken: import.meta.env.PUBLIC_CONTENTFUL_MANAGEMENT_TOKEN,
});

export async function fetchLandingPage() {
  const entries = await client.getEntries({
    content_type: 'pageLanding', // Content type ID for the landing page
    include: 3, // Include linked entries ( seoFields, featuredBlogPost)
  });

  if (!entries.items.length) return null;

  const item = entries.items[0];
  return {
    internalName: item.fields.internalName || 'Landing Page',
    seoFields: item.fields.seoFields?.fields || null, // Include SEO fields
    featuredBlogPost: item.fields.featuredBlogPost?.fields || null, 
    landingpageImage: item.fields.landingpageImage?.fields?.file?.url ? `https:${item.fields.landingpageImage.fields.file.url}` : '',
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
const options = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const url = node?.data?.target?.fields?.file?.url;
      if (!url) return ''; // Prevent errors if no image is found
      const alt = node?.data?.target?.fields?.title || 'Image';
      return `<img src="https:${url}" alt="${alt}" style="max-width: 100%; display: block; margin: 10px auto;" />`;
    },
  },
};

export async function fetchBlogPostBySlug(slug) {
  const entries = await client.getEntries({
    content_type: "pageBlogPost",
    "fields.slug": slug,
    include: 3, // Zorgt ervoor dat gerelateerde posts ook worden ingeladen
  });

  if (!entries.items.length) return null;

  const item = entries.items[0];

  console.log("🔍 Full Blog Post Entry:", JSON.stringify(item, getCircularReplacer(), 2));
  console.log("🖼 Gallery Images Data:", JSON.stringify(item.fields.galleryImages, null, 2));

  function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    };
  }
  
  let convertedContent = "";

  try {
    convertedContent = documentToHtmlString(item.fields.content, options);
  } catch (error) {
    console.error("Error converting Rich Text to HTML:", error);
  }

  // Gebruik een Set om dubbele of circulaire referenties te voorkomen
  const seenSlugs = new Set();
  const relatedPosts = [];

  if (item.fields.relatedBlogPosts) {
    item.fields.relatedBlogPosts.forEach((post) => {
      if (post?.fields?.slug && !seenSlugs.has(post.fields.slug)) {
        seenSlugs.add(post.fields.slug);
        relatedPosts.push({
          title: post.fields.title || "Untitled",
          slug: post.fields.slug || "",
        });
      }
    });
  }

  return {
    internalName: item.fields.internalName || "Untitled",
    slug: item.fields.slug,
    title: item.fields.title,
    shortDescription: item.fields.shortDescription || "",
    featuredImage: item.fields.featuredImage?.fields?.file?.url
      ? `https:${item.fields.featuredImage.fields.file.url}`
      : "",
    publishedDate: item.fields.publishedDate || null,
    author: item.fields.author?.fields?.name || "Unknown",
    seoFields: item.fields.seoFields || null,
    content: convertedContent,
    relatedBlogPosts: relatedPosts, // Nu zonder circulaire referenties
    galleryImages:
      item.fields.galleryImages?.map((image) => ({
        url: `https:${image.fields.file.url}`,
        title: image.fields.title || "Gallery Image",
      })) || [],
  };
}
