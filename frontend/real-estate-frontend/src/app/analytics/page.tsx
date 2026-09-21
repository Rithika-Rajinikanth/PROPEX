// src/app/analytics/page.tsx
'use client';

import { Dashboard } from '@/components/analytics/Dashboard';

export default function AnalyticsPage() {
  return <Dashboard defaultTab="overview" />;
}