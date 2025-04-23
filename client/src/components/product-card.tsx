import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isTicket = product.type === "ticket";
  const sizes = !isTicket && product.sizes ? product.sizes.split(",") : [];
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition group border-t-4 border-t-red-600">
      <div className="relative">
        <img 
          src={product.imageUrl || "https://via.placeholder.com/800x400"} 
          alt={product.name} 
          className={`w-full ${isTicket ? 'h-48' : 'h-64'} object-cover`} 
        />
        {product.name.includes("TEDx") && (
          <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-white text-xs font-bold">
            TEDx
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={isTicket ? "default" : "secondary"}>
            {isTicket ? product.category : "تيشيرت"}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1">{product.name}</h3>
        
        {isTicket ? (
          <div className="flex items-center text-gray-500 mb-3 text-sm">
            <CalendarIcon className="h-4 w-4 ml-1" />
            <span>{product.eventDate ? format(new Date(product.eventDate), "dd MMMM yyyy") : "تاريخ غير محدد"}</span>
            <MapPinIcon className="h-4 w-4 mr-3 ml-1" />
            <span className="truncate">{product.eventLocation || "مكان غير محدد"}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm mb-3">
            {sizes.map(size => (
              <span key={size} className="px-2 py-0.5 bg-gray-100 rounded">{size}</span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-primary font-bold text-lg">{product.price} نقطة</span>
            <span className="text-gray-500 text-xs">
              {product.unlimited ? "متوفر دائماً" : (product.stock ? `${product.stock} متبقي` : "نفذت الكمية")}
            </span>
          </div>
          <Link href={`/product/${product.id}`}>
            <Button size="sm" className={`${product.name.includes("TEDx") ? "bg-red-600 hover:bg-red-700" : ""}`}>
              {isTicket ? "شراء التذكرة" : "إضافة للسلة"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
