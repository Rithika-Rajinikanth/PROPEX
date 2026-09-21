// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  User,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/marketplace', label: 'Marketplace', icon: Search },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/ai-chat', label: 'AI Assistant', icon: MessageSquare },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(222_14%_18%)] bg-[hsl(222_20%_8%/0.95)] backdrop-blur-md supports-[backdrop-filter]:bg-[hsl(222_20%_8%/0.8)]">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] shadow-lg shadow-[hsl(38_80%_57%/0.25)] group-hover:shadow-[hsl(38_80%_57%/0.4)] transition-shadow">
            <Home className="h-5 w-5" />
          </div>
          <span className="hidden font-serif font-semibold sm:inline-block text-lg text-foreground tracking-tight">
            RealEstate <span className="text-[hsl(38_80%_57%)]">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                isActive(item.href)
                  ? 'text-[hsl(38_80%_57%)] bg-[hsl(38_40%_18%)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(222_16%_16%)]'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-1">
          <Link href="/saved">
            <Button variant="ghost" size="icon" title="Saved Properties" className="text-muted-foreground hover:text-[hsl(38_80%_57%)] hover:bg-[hsl(38_40%_18%)]">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link href="/profile">
            <Button variant="ghost" size="icon" title="Profile" className="text-muted-foreground hover:text-foreground hover:bg-[hsl(222_16%_16%)]">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-[hsl(222_14%_18%)] md:hidden bg-[hsl(222_20%_10%)]">
          <nav className="flex flex-col space-y-1 p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-[hsl(38_40%_18%)] text-[hsl(38_80%_57%)]'
                    : 'text-muted-foreground hover:bg-[hsl(222_16%_16%)] hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
