import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/lib/data";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

const CategoryCard = ({ category, className }: CategoryCardProps) => {
  return (
    <Link to={`/shop?category=${category.id}`}>
      <Card
        className={cn(
          "group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer",
          className,
        )}
      >
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Category Icon */}
            <div
              className={cn(
                "absolute top-3 left-3 h-10 w-10 rounded-xl flex items-center justify-center text-white text-xl shadow-lg",
                category.color,
              )}
            >
              {category.icon}
            </div>

            {/* Product Count Badge */}
            <Badge
              variant="secondary"
              className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs"
            >
              {category.productCount} productos
            </Badge>

            {/* Category Name */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-semibold text-white text-lg leading-tight">
                {category.name}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
