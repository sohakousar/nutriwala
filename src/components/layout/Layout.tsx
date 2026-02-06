import { ReactNode } from "react";

import { TubelightHeader } from "@/components/ui/tubelight-navbar";
import MobileBottomNav from "./MobileBottomNav";
import FloatingCartButton from "./FloatingCartButton";
import { Footerdemo } from "@/components/ui/footer-section";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const Layout = ({ children, showFooter = true }: LayoutProps) => {
  return (
    <div className="min-h-screen relative">
      {/* Global animated shader background */}
      {/* Global background - default to soft cream */}
      <div className="fixed inset-0 z-0 bg-soft-cream" />

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <TubelightHeader />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        {showFooter && <Footerdemo />}
        <FloatingCartButton />
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default Layout;
