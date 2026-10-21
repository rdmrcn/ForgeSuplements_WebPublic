import { CategoryGrid } from "@/components/home/category-grid";
import { Hero } from "@/components/home/hero";
import { BestSellers, BrandStory, DeliveryBand, FeaturedProducts, Standards } from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DeliveryBand />
      <CategoryGrid />
      <FeaturedProducts />
      <BrandStory />
      <BestSellers />
      <Standards />
    </>
  );
}
