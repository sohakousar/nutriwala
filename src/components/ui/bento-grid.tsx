"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom";

export interface BentoCardProps {
    title: string;
    description: string;
    className?: string;
    href?: string;
    graphic?: React.ReactNode;
}

export const BentoCard: React.FC<BentoCardProps> = ({
    className = "",
    title,
    description,
    href,
    graphic
}) => {
    const Content = () => (
        <>
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold font-serif">
                        {title}
                    </h3>
                    <p className="text-muted-foreground text-base leading-relaxed">{description}</p>
                </div>
                {graphic && <div className="mt-6 -mb-6 -mx-6">{graphic}</div>}
            </div>
            {/* Background Gradient/Glow Effect for some styling */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </>
    );

    const commonClasses = cn(
        "group relative border border-border/40 shadow-sm rounded-3xl p-8 bg-white dark:bg-zinc-900 min-h-[220px] overflow-hidden hover:shadow-md hover:border-accent/30 transition-all duration-300",
        className
    );

    if (href) {
        return (
            <Link
                to={href}
                className={commonClasses}
            >
                <Content />
            </Link>
        )
    }

    return (
        <div className={commonClasses}>
            <Content />
        </div>
    )
}



export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-auto gap-8", className)}>
            {children}
        </div>
    )
}
