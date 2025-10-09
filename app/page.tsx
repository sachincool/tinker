import { headers } from 'next/headers';
import AboutPage from './about/page';
import HomePageContent from './home-page-content';
import { getAllPosts } from '@/lib/posts';

export default async function RootPage() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  
  // Show About page for harshit.cloud (main domain)
  if (hostname === 'harshit.cloud' || hostname === 'www.harshit.cloud') {
    return <AboutPage />;
  }
  
  // Fetch latest blog posts for homepage
  const allBlogPosts = getAllPosts('blog');
  const latestPosts = allBlogPosts.slice(0, 2); // Get 2 most recent posts
  
  // Show normal homepage for blog.harshit.cloud, tinker.expert, and localhost
  return <HomePageContent latestPosts={latestPosts} />;
}
