import { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FeatureProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface FeaturesSectionProps {
    title: string;
    description: string;
    features: FeatureProps[];
    className?: string;
}

export function FeaturesSection({ title, description, features, className }: FeaturesSectionProps) {
    return (
        <section className={cn("py-12 md:py-20 bg-soft-cream/30 dark:bg-zinc-900/20", className)}>
            <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-serif font-bold lg:text-5xl text-primary dark:text-white">
                        {title}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {description}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white dark:bg-card p-8 rounded-2xl border border-border/40 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="h-6 w-6 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold font-serif text-primary dark:text-white mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
