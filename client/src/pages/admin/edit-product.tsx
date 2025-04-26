import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";

// Form schema for product editing
const editProductSchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  description: z.string().optional(),
  imageUrl: z.string().url("الرجاء إدخال رابط صورة صالح").optional().or(z.literal("")),
  category: z.string().min(1, "الرجاء اختيار فئة"),
  price: z.coerce.number().min(1, "السعر يجب أن يكون أكبر من 0"),
  stock: z.coerce.number().min(0, "المخزون لا يمكن أن يكون سالباً"),
  unlimited: z.boolean().default(false),
  type: z.string().min(1, "الرجاء اختيار نوع المنتج"),
  eventDate: z.date().optional().nullable(),
  eventLocation: z.string().optional(),
  sizes: z.string().optional(),
});

// Product editing component
export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form handling
  const form = useForm<z.infer<typeof editProductSchema>>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      category: "",
      price: 0,
      stock: 0,
      unlimited: false,
      type: "",
      eventLocation: "",
      sizes: "",
    },
  });

  // Fetch product data
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
  });

  // Update form values when product data is loaded
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        category: product.category,
        price: product.price,
        stock: product.stock || 0,
        unlimited: product.unlimited || false,
        type: product.type,
        eventDate: product.eventDate ? new Date(product.eventDate) : null,
        eventLocation: product.eventLocation || "",
        sizes: product.sizes || "",
      });
    }
  }, [product, form]);

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: z.infer<typeof editProductSchema>) => {
      const response = await apiRequest(`/api/admin/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث المنتج بنجاح",
        description: "تم حفظ التغييرات بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      navigate("/admin/products");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث المنتج",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  const onSubmit = (data: z.infer<typeof editProductSchema>) => {
    updateProductMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96 flex-col">
        <p className="text-destructive text-lg mb-4">خطأ في تحميل بيانات المنتج</p>
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          العودة للمنتجات
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => navigate("/admin/products")}
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">تعديل المنتج</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات المنتج</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* اسم المنتج */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المنتج</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أدخل اسم المنتج" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* السعر */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر (بالنقاط)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* رابط الصورة */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الصورة</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أدخل رابط الصورة" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* نوع المنتج */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع المنتج</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع المنتج" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ticket">تذكرة</SelectItem>
                          <SelectItem value="tshirt">تيشيرت</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* الفئة */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أدخل فئة المنتج" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* المخزون */}
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المخزون</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field} 
                          disabled={form.getValues("unlimited")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* غير محدود */}
                <FormField
                  control={form.control}
                  name="unlimited"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-x-reverse rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>متوفر دائماً</FormLabel>
                        <FormDescription>
                          عند تفعيل هذا الخيار، سيكون المنتج متاحاً دائماً بغض النظر عن المخزون
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* محتوى شرطي لنوع المنتج */}
                {form.watch("type") === "ticket" ? (
                  <>
                    {/* تاريخ الفعالية */}
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الفعالية</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              value={field.value ? new Date(field.value).toISOString().substring(0, 10) : ""}
                              onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : null;
                                field.onChange(date);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* مكان الفعالية */}
                    <FormField
                      control={form.control}
                      name="eventLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مكان الفعالية</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل مكان الفعالية" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : form.watch("type") === "tshirt" ? (
                  <FormField
                    control={form.control}
                    name="sizes"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>المقاسات المتاحة</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="المقاسات مفصولة بفواصل، مثال: S, M, L, XL"
                          />
                        </FormControl>
                        <FormDescription>
                          أدخل المقاسات المتاحة مفصولة بفواصل
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>

              {/* الوصف */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف المنتج</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="أدخل وصف المنتج" 
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* معاينة الصورة */}
              {form.watch("imageUrl") && (
                <div className="mt-4">
                  <Label>معاينة الصورة</Label>
                  <div className="mt-2 border rounded-md overflow-hidden w-full max-w-[300px] h-[200px]">
                    <img 
                      src={form.watch("imageUrl")} 
                      alt="معاينة المنتج" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/300x200?text=صورة+غير+متوفرة";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/products")}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit"
                  disabled={updateProductMutation.isPending}
                  className="gap-2"
                >
                  {updateProductMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}