import { motion } from "framer-motion";
import { LayoutGrid } from "@/components/ui/layout-grid";

const SkeletonOne = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white font-serif drop-shadow-md">
        Premium Almonds
      </p>
      <p className="font-normal text-base text-white/90"></p>
      <p className="font-normal text-base my-4 max-w-lg text-white/80 drop-shadow-sm">
        California almonds, rich in Vitamin E and healthy fats. Perfect for brain health and daily nutrition.
      </p>
    </div>
  );
};

const SkeletonTwo = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white font-serif drop-shadow-md">
        Kashmir Walnuts
      </p>
      <p className="font-normal text-base text-white/90"></p>
      <p className="font-normal text-base my-4 max-w-lg text-white/80 drop-shadow-sm">
        Handpicked from the valleys of Kashmir, our walnuts are packed with omega-3 fatty acids for heart health.
      </p>
    </div>
  );
};

const SkeletonThree = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white font-serif drop-shadow-md">
        Golden Cashews
      </p>
      <p className="font-normal text-base text-white/90"></p>
      <p className="font-normal text-base my-4 max-w-lg text-white/80 drop-shadow-sm">
        Premium quality cashews sourced from the finest farms. Creamy, delicious, and full of essential minerals.
      </p>
    </div>
  );
};

const SkeletonFour = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white font-serif drop-shadow-md">
        Organic Dates
      </p>
      <p className="font-normal text-base text-white/90"></p>
      <p className="font-normal text-base my-4 max-w-lg text-white/80 drop-shadow-sm">
        Nature's candy - organic dates that provide instant energy and are rich in fiber and natural sugars.
      </p>
    </div>
  );
};

const cards = [
  {
    id: 1,
    content: <SkeletonOne />, // Premium Almonds
    className: "md:col-span-2",
    thumbnail:
      "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill,g_auto/v1770463839/Whisk_d94d00ba22b96978f944ab0128790f0cdr_cn3rln.jpg",
  },
  {
    id: 2,
    content: <SkeletonTwo />, // Kashmir Walnuts
    className: "col-span-1",
    thumbnail:
      "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill,g_auto/v1770462773/Whisk_16a4cfae87536ee8fa04a3593422ddf0dr_1_wcy4ok.jpg",
  },
  {
    id: 3,
    content: <SkeletonThree />, // Golden Cashews
    className: "col-span-1",
    thumbnail:
      "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill,g_auto/v1770462772/Whisk_932654422dea2a78d3a49f789ed02640dr_cthey1.jpg",
  },
  {
    id: 4,
    content: <SkeletonFour />, // Ajwa Dates
    className: "md:col-span-2",
    thumbnail:
      "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill,g_auto/v1770463839/Whisk_32ce84008eb95eb85224f69b8bbc1619dr_ejbnfp.jpg",
  },
];


const HealthBenefits = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-soft-cream">

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4 tracking-wider uppercase">
            Our Collection
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 text-primary">
            Explore <span className="text-accent italic">Nature's Finest</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Click on any product to discover its unique health benefits and premium quality.
          </p>
        </motion.div>

        {/* Layout Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-[700px] md:h-[600px]"
        >
          <LayoutGrid cards={cards} />
        </motion.div>
      </div>
    </section>
  );
};

export default HealthBenefits;
