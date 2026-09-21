// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  TrendingUp,
  Map,
  BarChart3,
  Activity,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Analytics',
      items: [
        {
          href: '/analytics',
          label: 'Dashboard',
          icon: LayoutDashboard,
          description: 'Overview & key metrics'
        },
        {
          href: '/analytics/trends',
          label: 'Market Trends',
          icon: TrendingUp,
          description: 'Price trends & forecasts'
        },
        {
          href: '/analytics/heatmap',
          label: 'Heat Map',
          icon: Map,
          description: 'Geographic analysis'
        },
        {
          href: '/analytics/comparison',
          label: 'Compare Markets',
          icon: BarChart3,
          description: 'Side-by-side comparison'
        },
        {
          href: '/analytics/activity',
          label: 'Market Activity',
          icon: Activity,
          description: 'Sales & inventory trends'
        },
        {
          href: '/analytics/affordability',
          label: 'Affordability',
          icon: DollarSign,
          description: 'Price-to-income ratios'
        },
      ]
    }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className={cn('w-64 border-r border-cyan-500/20 bg-[#060A14] backdrop-blur-xl', className)}>
      <nav className="space-y-6 p-4">
        {menuItems.map((section) => (
          <div key={section.title}>
            <h2 className="mb-3 px-3 text-[10px] font-semibold tracking-[0.18em] uppercase text-cyan-400 font-mono">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-start space-x-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 border',
                    isActive(item.href)
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 hover:border-white/10'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', isActive(item.href) ? 'text-cyan-400' : 'text-slate-500')} />
                  <div className="flex-1 min-w-0">
                    <div className={cn('font-medium text-sm', isActive(item.href) ? 'text-white font-semibold' : 'text-slate-300')}>
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
