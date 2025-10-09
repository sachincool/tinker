import { headers } from 'next/headers';
import AboutPage from './about/page';
import HomePageContent from './home-page-content';

export default async function RootPage() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  
  // Show About page for harshit.cloud (main domain)
  if (hostname === 'harshit.cloud' || hostname === 'www.harshit.cloud') {
    return <AboutPage />;
  }
  
  // Show normal homepage for blog.harshit.cloud, tinker.expert, and localhost
  return <HomePageContent />;
}
