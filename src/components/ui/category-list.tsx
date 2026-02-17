"use client";
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

// Define the type for a single category item
export interface Category {
    id: string | number;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    featured?: boolean;
}

// Define the props for the CategoryList component
export interface CategoryListProps {
    title: string;
    subtitle?: string;
    categories: Category[];
    headerIcon?: React.ReactNode;
    className?: string;
}

export const CategoryList = ({
    title,
    subtitle,
    categories,
    headerIcon,
    className,
}: CategoryListProps) => {
    const [hoveredItem, setHoveredItem] = useState<string | number | null>(null);

    return (
        <div className={cn("w-full bg-background text-foreground py-16", className)}>
            <div className="max-w-4xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12 md:mb-16">
                    {headerIcon && (
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6 text-accent">
                            {headerIcon}
                        </div>
                    )}
                    <h2 className="text-4xl md:text-5xl font-bold font-serif mb-2 tracking-tight text-primary">{title}</h2>
                    {subtitle && (
                        <h3 className="text-2xl md:text-3xl font-medium text-muted-foreground">{subtitle}</h3>
                    )}
                </div>

                {/* Categories List */}
                <div className="space-y-4">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="relative group"
                            onMouseEnter={() => setHoveredItem(category.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={category.onClick}
                        >
                            <div
                                className={cn(
                                    "relative overflow-hidden border rounded-xl transition-all duration-300 ease-in-out cursor-pointer",
                                    // Hover state styles
                                    hoveredItem === category.id
                                        ? 'h-auto py-2 border-accent shadow-md shadow-accent/10 bg-accent/5'
                                        : 'h-auto py-2 border-border bg-card hover:border-accent/40'
                                )}
                            >
                                {/* Content */}
                                <div className="flex items-center justify-between h-full px-6 md:px-10 py-6">
                                    <div className="flex-1 pr-6">
                                        <h3
                                            className={cn(
                                                "font-bold transition-colors duration-300 font-serif mb-2",
                                                category.featured ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl',
                                                hoveredItem === category.id ? 'text-primary' : 'text-foreground'
                                            )}
                                        >
                                            {category.title}
                                        </h3>
                                        {category.subtitle && (
                                            <p
                                                className={cn(
                                                    "transition-colors duration-300 text-base md:text-lg leading-relaxed max-w-2xl",
                                                    hoveredItem === category.id ? 'text-foreground/90' : 'text-muted-foreground'
                                                )}
                                            >
                                                {category.subtitle}
                                            </p>
                                        )}
                                    </div>

                                    {/* Icon appears on the right on hover */}
                                    <div className={cn(
                                        "transition-all duration-300 transform shrink-0",
                                        hoveredItem === category.id ? "opacity-100 translate-x-0 text-accent scale-110" : "opacity-0 translate-x-4 text-accent/50"
                                    )}>
                                        {category.icon || <ArrowRight className="w-10 h-10" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
