import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ContentSection } from '@/components/ContentSection';
import { Footer } from '@/components/Footer';
import { GDPRConsent } from '@/components/GDPRConsent';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <ContentSection />
        <GDPRConsent />
      </main>
      <Footer />
    </div>
   
  );
};

export default Index;
