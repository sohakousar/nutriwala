import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  // Product-specific
  product?: {
    name: string;
    description: string;
    price: number;
    currency?: string;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
    sku?: string;
    brand?: string;
    image?: string;
    ratingValue?: number;
    reviewCount?: number;
  };
  // Organization schema
  showOrganization?: boolean;
  // Breadcrumbs
  breadcrumbs?: Array<{ name: string; url: string }>;
  // FAQ schema
  faqs?: Array<{ question: string; answer: string }>;
  // Prevent indexing
  noIndex?: boolean;
}

const SITE_NAME = "Nutriwala";
const SITE_URL = "https://nutriwala.com";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=1200&h=630&fit=crop";
const DEFAULT_DESCRIPTION = "Premium dry fruits and healthy foods delivered fresh to your doorstep. Experience nature's finest treasures with Nutriwala.";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = "dry fruits, nuts, almonds, cashews, walnuts, healthy snacks, premium dry fruits, organic nuts, Indian dry fruits, gift hampers",
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  product,
  showOrganization = false,
  breadcrumbs,
  faqs,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Premium Dry Fruits & Healthy Foods`;
  const fullUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-98765-43210",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [
      "https://facebook.com/nutriwala",
      "https://instagram.com/nutriwala",
      "https://twitter.com/nutriwala",
    ],
  };

  // Product schema
  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.image || image,
        sku: product.sku,
        brand: {
          "@type": "Brand",
          name: product.brand || SITE_NAME,
        },
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: product.currency || "INR",
          availability: `https://schema.org/${product.availability || "InStock"}`,
          seller: {
            "@type": "Organization",
            name: SITE_NAME,
          },
        },
        ...(product.ratingValue && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.ratingValue,
            reviewCount: product.reviewCount || 1,
          },
        }),
      }
    : null;

  // Breadcrumb schema
  const breadcrumbSchema = breadcrumbs
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
        })),
      }
    : null;

  // FAQ schema
  const faqSchema = faqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {author && <meta name="author" content={author} />}
      <link rel="canonical" href={fullUrl} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@nutriwala" />

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#166534" />

      {/* Structured Data */}
      {showOrganization && (
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      )}
      {productSchema && (
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
    </Helmet>
  );
}

export default SEO;
