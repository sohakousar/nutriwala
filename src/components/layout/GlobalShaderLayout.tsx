import { ReactNode } from "react";

import { TubelightHeader } from "@/components/ui/tubelight-navbar";
import MobileBottomNav from "./MobileBottomNav";
import FloatingCartButton from "./FloatingCartButton";

interface GlobalShaderLayoutProps {
  children: ReactNode;
}

const GlobalShaderLayout = ({ children }: GlobalShaderLayoutProps) => {
  return (
    <div className="min-h-screen relative bg-soft-cream">
      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <TubelightHeader />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <FloatingCartButton />
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default GlobalShaderLayout;

