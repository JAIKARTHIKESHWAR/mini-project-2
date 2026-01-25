import HeroCard from "./sections/HeroCard";
import PerfumeCustomizeCard from "./sections/PerfumeCustomizeCard";
import MaestroCard from "./sections/MaestroCard";
import ShopCard from "./sections/ShopCard";
import QuotesCard from "./sections/QuotesCard";

const HomePage = () => {
  return (
    <div className="w-full bg-background p-4 lg:p-6">
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-[1fr_1fr] gap-4 lg:gap-5 min-h-full">
        {/* Hero Card - Spans 2 columns on large screens */}
        <div className="lg:col-span-2 lg:row-span-1 order-1">
          <HeroCard />
        </div>

        {/* Customize Card */}
        <div className="order-2 lg:order-2">
          <PerfumeCustomizeCard />
        </div>

        {/* Maestro Card */}
        <div className="order-3 lg:order-3">
          <MaestroCard />
        </div>

        {/* Shop Card */}
        <div className="order-4 lg:order-4">
          <ShopCard />
        </div>

        {/* Quotes Card */}
        <div className="order-5 lg:order-5">
          <QuotesCard />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
