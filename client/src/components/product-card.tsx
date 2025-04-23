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
    <Card className="overflow-hidden hover:shadow-lg transition group">
      <div className="relative">
        <img 
          src={product.imageUrl || "https://via.placeholder.com/800x400"} 
          alt={product.name} 
          className={`w-full ${isTicket ? 'h-48' : 'h-64'} object-cover`} 
        />
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
          <span className="text-primary font-bold">{product.price} نقطة</span>
          <Link href={`/product/${product.id}`}>
            <Button size="sm">
              {isTicket ? "شراء التذكرة" : "إضافة للسلة"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
