import { DailyDeal } from "@/components/deal/daily-deal";
import { CategoryGrid } from "@/components/home/category-grid";
import { GoalGrid } from "@/components/home/goal-grid";
import { Hero } from "@/components/home/hero";
import { BestSellers, BrandStory, DeliveryBand, FeaturedProducts, Standards } from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DeliveryBand />
      <GoalGrid />
      <DailyDeal className="pb-20 sm:pb-28" />
      <CategoryGrid />
      <FeaturedProducts />
      <BrandStory />
      <BestSellers />
      <Standards />
    </>
  );
}
