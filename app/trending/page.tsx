import { getAllPosts, getAllCategories, getAllTags } from "@/lib/wordpress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trending Topics",
  description: "Discover what's popular across our blog",
};

interface TopicStats {
  id: number;
  name: string;
  count: number;
  type: 'category' | 'tag';
  slug: string;
}

async function getTopicStats() {
  const [posts, categories, tags] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
    getAllTags(),
  ]);

  // Process categories
  const categoryStats: TopicStats[] = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    count: cat.count || 0,
    type: 'category',
    slug: cat.slug,
  }));

  // Process tags
  const tagStats: TopicStats[] = tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    count: tag.count || 0,
    type: 'tag',
    slug: tag.slug,
  }));

  // Combine and sort by count
  const allTopics = [...categoryStats, ...tagStats]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 topics

  return {
    topics: allTopics,
    recentPosts: posts.slice(0, 5), // Latest 5 posts
    totalPosts: posts.length,
  };
}

export default async function TrendingPage() {
  const { topics, recentPosts, totalPosts } = await getTopicStats();

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="prose max-w-none mb-12">
          <h1>Trending Topics</h1>
          <p className="lead">
            Explore our most discussed topics and latest content across {totalPosts} posts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Popular Topics Column */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
            <div className="grid grid-cols-2 gap-4">
              {topics.map((topic) => (
                <Link 
                  key={`${topic.type}-${topic.id}`}
                  href={`/posts/?${topic.type}=${topic.id}`}
                >
                  <Card className="p-4 hover:bg-muted transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{topic.name}</h3>
                      <Badge variant={topic.type === 'category' ? 'default' : 'secondary'}>
                        {topic.count}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {topic.type === 'category' ? 'Category' : 'Tag'}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Latest Posts Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Latest Updates</h2>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Link 
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="block p-4 rounded-lg hover:bg-muted transition-colors"
                >
                  <h3 className="font-medium mb-2">{post.title.rendered}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 