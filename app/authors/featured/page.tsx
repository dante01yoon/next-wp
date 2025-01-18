import { getAllAuthors, getPostsByAuthor } from "@/lib/wordpress";
import { Section, Container, Prose } from "@/components/craft";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Author, Post } from "@/lib/wordpress.d";

export const metadata: Metadata = {
  title: "Featured Authors",
  description: "Meet our talented content creators and read their latest works",
};

async function getFeaturedAuthorsWithPosts() {
  const authors = await getAllAuthors();
  
  // Get the 3 authors with posts
  const featuredAuthors = await Promise.all(
    authors.slice(0, 3).map(async (author) => {
      const posts = await getPostsByAuthor(author.id);
      return {
        ...author,
        posts: posts.slice(0, 3), // Get latest 3 posts
        postCount: posts.length,
      };
    })
  );

  return featuredAuthors;
}

export default async function FeaturedAuthors() {
  const featuredAuthors = await getFeaturedAuthorsWithPosts();

  return (
    <Section>
      <Container>
        <Prose className="mb-12">
          <h1>Featured Authors</h1>
          <p className="lead">
            Meet the brilliant minds behind our content. Each author brings their unique 
            perspective and expertise to help you stay informed and inspired.
          </p>
        </Prose>

        <div className="grid gap-12">
          {featuredAuthors.map((author) => (
            <div key={author.id} className="grid gap-6 p-6 rounded-lg border bg-card">
              <div className="flex items-start gap-6">
                {author.avatar_urls?.["96"] && (
                  <Image
                    src={author.avatar_urls["96"]}
                    alt={author.name}
                    width={96}
                    height={96}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold">{author.name}</h2>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{author.postCount} Posts</Badge>
                    {author.url && (
                      <Badge variant="outline">
                        <Link href={author.url}>Website</Link>
                      </Badge>
                    )}
                  </div>
                  {author.description && (
                    <p className="mt-4 text-muted-foreground">{author.description}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Latest Posts</h3>
                <div className="grid gap-4">
                  {author.posts.map((post: Post) => (
                    <Link 
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="group p-4 rounded-md hover:bg-muted transition-colors"
                    >
                      <h4 className="font-medium group-hover:text-primary">
                        {post.title.rendered}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(post.date).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
} 