import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

// Extend the product schema with validation
const productFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(1, "Price must be at least 1 point"),
  stock: z.number().min(0, "Stock cannot be negative"),
  unlimited: z.boolean().default(false),
  type: z.enum(["ticket", "tshirt"]),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  sizes: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AddProductForm() {
  const { toast } = useToast();
  const [productType, setProductType] = useState<"ticket" | "tshirt">("ticket");
  
  // Product form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      category: "",
      price: 0,
      stock: 0,
      unlimited: false,
      type: "ticket",
    },
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const res = await apiRequest("POST", "/api/products", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة المنتج بنجاح",
      });
      
      // Reset form and invalidate products query
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إضافة المنتج",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  function onSubmit(data: ProductFormValues) {
    // Convert stock to number
    data.stock = Number(data.stock);
    data.price = Number(data.price);
    
    addProductMutation.mutate(data);
  }

  // Handle product type change
  function handleTypeChange(value: string) {
    if (value === "ticket" || value === "tshirt") {
      setProductType(value);
      form.setValue("type", value);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>نوع المنتج</Label>
        <Select onValueChange={handleTypeChange} defaultValue="ticket">
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع المنتج" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ticket">تذكرة فعالية</SelectItem>
            <SelectItem value="tshirt">تيشيرت</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>اسم المنتج</Label>
        <Input 
          placeholder="اسم المنتج"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>الوصف</Label>
        <Textarea 
          placeholder="وصف المنتج"
          rows={3}
          {...form.register("description")}
        />
      </div>
      
      <div className="space-y-2">
        <Label>السعر (نقاط)</Label>
        <Input 
          type="number" 
          placeholder="السعر بالنقاط"
          {...form.register("price", { valueAsNumber: true })}
        />
        {form.formState.errors.price && (
          <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>الفئة</Label>
        <Input 
          placeholder={productType === "ticket" ? "مثال: حفل موسيقي، مؤتمر" : "مثال: رياضي، عصري"}
          {...form.register("category")}
        />
      </div>
      
      <div className="space-y-2">
        <Label>صورة المنتج (URL)</Label>
        <Input 
          placeholder="رابط الصورة"
          {...form.register("imageUrl")}
        />
        {form.formState.errors.imageUrl && (
          <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2 space-x-reverse">
        <Switch 
          id="unlimited"
          checked={form.watch("unlimited")}
          onCheckedChange={(checked) => form.setValue("unlimited", checked)}
        />
        <Label htmlFor="unlimited">كمية غير محدودة</Label>
      </div>
      
      {!form.watch("unlimited") && (
        <div className="space-y-2">
          <Label>العدد المتاح</Label>
          <Input 
            type="number" 
            placeholder="العدد المتاح"
            {...form.register("stock", { valueAsNumber: true })}
          />
        </div>
      )}
      
      {/* Ticket-specific fields */}
      {productType === "ticket" && (
        <>
          <div className="space-y-2">
            <Label>تاريخ الفعالية</Label>
            <Input 
              type="datetime-local" 
              {...form.register("eventDate")}
            />
          </div>
          
          <div className="space-y-2">
            <Label>مكان الفعالية</Label>
            <Input 
              placeholder="مكان الفعالية" 
              {...form.register("eventLocation")}
            />
          </div>
        </>
      )}
      
      {/* T-shirt-specific fields */}
      {productType === "tshirt" && (
        <div className="space-y-2">
          <Label>المقاسات المتاحة (مفصولة بفواصل)</Label>
          <Input 
            placeholder="مثال: S,M,L,XL" 
            {...form.register("sizes")}
          />
          <p className="text-xs text-gray-500">أدخل المقاسات مفصولة بفواصل، مثل: S,M,L,XL</p>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={addProductMutation.isPending}
      >
        {addProductMutation.isPending ? "جاري الإضافة..." : "إضافة المنتج"}
      </Button>
    </form>
  );
}
