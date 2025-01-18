import { getAllPosts, getTagsByPost, getCategoryById } from "@/lib/wordpress";
import { Section, Container, Prose } from "@/components/craft";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Post Explorer",
  description: "Discover related content through an interactive post explorer",
};

interface EnrichedPost {
  id: number;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  categoryName?: string;
  tags: Array<{ id: number; name: string }>;
}

async function getEnrichedPosts() {
  const posts = await getAllPosts();
  
  // Enrich the first 10 posts with their tags and category details
  const enrichedPosts = await Promise.all(
    posts.slice(0, 10).map(async (post) => {
      const [tags, category] = await Promise.all([
        getTagsByPost(post.id),
        post.categories?.[0] ? getCategoryById(post.categories[0]) : null,
      ]);

      return {
        id: post.id,
        title: post.title.rendered,
        slug: post.slug,
        date: post.date,
        excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, '').slice(0, 150) + '...',
        categoryName: category?.name,
        tags: tags,
      };
    })
  );

  return enrichedPosts;
}

export default async function ExplorerPage() {
  const posts = await getEnrichedPosts();

  return (
    <Section>
      <Container>
        <Prose className="mb-12">
          <h1>Post Explorer</h1>
          <p className="lead">
            Discover the connections between our posts through shared topics and themes.
          </p>
        </Prose>

        <ScrollArea className="h-[800px] rounded-lg border p-4">
          {posts.map((post, index) => (
            <div 
              key={post.id}
              className="mb-8 p-6 rounded-lg bg-card border last:mb-0"
            >
              <div className="space-y-4">
                <div>
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="text-xl font-semibold hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-muted-foreground">{post.excerpt}</p>

                <div className="space-y-2">
                  {post.categoryName && (
                    <div>
                      <span className="text-sm font-medium">Category: </span>
                      <Link 
                        href={`/posts/?category=${post.categoryName}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {post.categoryName}
                      </Link>
                    </div>
                  )}

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium">Tags: </span>
                      {post.tags.map((tag) => (
                        <Button
                          key={tag.id}
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/posts/?tag=${tag.id}`}>
                            {tag.name}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </Container>
    </Section>
  );
} 