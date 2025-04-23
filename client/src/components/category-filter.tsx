import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";

interface CategoryFilterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function CategoryFilter({ activeCategory, setActiveCategory }: CategoryFilterProps) {
  // Fetch all products to extract categories
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Extract unique categories
  const categories = products 
    ? ["all", ...new Set(products.map(p => p.category))]
    : ["all"];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex py-2 space-x-4 space-x-reverse">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex-shrink-0 px-5 py-2 rounded-full font-medium transition ${
              activeCategory === category
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            {category === "all" ? "الكل" : category}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
