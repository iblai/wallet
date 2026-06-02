"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AnalyticsLayout,
  AnalyticsSettingsProvider,
} from "@iblai/iblai-js/web-containers";

import { MainLayout } from "@/components/layout/main-layout";

export default function AnalyticsLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = "/analytics";

  return (
    <MainLayout>
      {/* Fixed-height flex container so AnalyticsLayout's `flex-1 h-full
       * overflow-hidden` resolves. The SDK keeps the tabs row sticky at the
       * top and scrolls the content area inside. 65px ≈ navbar header. */}
      <div className="flex h-[calc(100dvh-65px)] bg-[#f5f7fb]">
        <AnalyticsSettingsProvider value={{}}>
          <AnalyticsLayout
            currentPath={pathname ?? basePath}
            basePath={basePath}
            onTabChange={(tab) => router.push(tab ? `${basePath}/${tab}` : basePath)}
          >
            {children}
          </AnalyticsLayout>
        </AnalyticsSettingsProvider>
      </div>
    </MainLayout>
  );
}
