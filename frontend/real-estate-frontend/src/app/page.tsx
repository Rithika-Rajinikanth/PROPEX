// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, TrendingUp, Brain, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Perfect Property with AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Advanced market analytics, intelligent search, and AI-powered
              insights to make informed real estate decisions.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/search">
                <Button size="lg">Start Searching</Button>
              </Link>
              <Link href="/analytics">
                <Button size="lg" variant="outline">
                  View Market Trends
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Search className="h-8 w-8" />}
              title="Smart Search"
              description="Find properties with advanced filters and real-time data"
              href="/search"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Market Analytics"
              description="Track trends and analyze market performance"
              href="/analytics"
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="AI Assistant"
              description="Get personalized recommendations and insights"
              href="/ai-chat"
            />
            <FeatureCard
              icon={<MapPin className="h-8 w-8" />}
              title="Region Explorer"
              description="Explore regions with detailed metrics"
              href="/regions"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="text-primary mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </Card>
    </Link>
  );
}
