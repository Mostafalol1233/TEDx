import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, InsertProduct } from "@shared/schema";
import { Sidebar, adminSidebarItems } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Pencil, Plus, Trash2, ShirtIcon, Ticket, Search, ArrowUpDown, Check, X } from "lucide-react";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [productType, setProductType] = useState<string>("all");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    type: "ticket",
    category: "",
    eventDate: "",
    eventLocation: "",
    imageUrl: "",
    stock: 10,
    unlimited: false,
    sizes: ""
  });

  // Fetch products
  const { data: products = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المنتج بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      const res = await apiRequest("POST", "/api/admin/products", product);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الإضافة بنجاح",
        description: "تم إضافة المنتج بنجاح",
      });
      setFormData({
        name: "",
        description: "",
        price: 0,
        type: "ticket",
        category: "",
        eventDate: "",
        eventLocation: "",
        imageUrl: "",
        stock: 10,
        unlimited: false,
        sizes: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل الإضافة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async (product: Partial<Product> & { id: number }) => {
      const { id, ...updateData } = product;
      const res = await apiRequest("PATCH", `/api/admin/products/${id}`, updateData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التعديل بنجاح",
        description: "تم تعديل المنتج بنجاح",
      });
      setActiveProduct(null);
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل التعديل",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
    };
    createMutation.mutate(productData as InsertProduct);
  };

  // Handle edit form submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    
    const updateData = {
      id: activeProduct.id,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
      eventLocation: formData.eventLocation,
      imageUrl: formData.imageUrl,
      stock: formData.stock,
      unlimited: formData.unlimited,
      sizes: formData.sizes,
    };

    updateMutation.mutate(updateData);
  };

  // Handle edit button click
  const handleEditClick = (product: Product) => {
    setActiveProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      type: product.type,
      category: product.category,
      eventDate: product.eventDate ? new Date(product.eventDate).toLocaleDateString('en-CA') : "", // YYYY-MM-DD format
      eventLocation: product.eventLocation || "",
      imageUrl: product.imageUrl || "",
      stock: product.stock || 0,
      unlimited: product.unlimited || false,
      sizes: product.sizes || "",
    });
    setEditMode(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      type: "ticket",
      category: "",
      eventDate: "",
      eventLocation: "",
      imageUrl: "",
      stock: 10,
      unlimited: false,
      sizes: ""
    });
    setActiveProduct(null);
    setEditMode(false);
  };

  // Handle sort toggle
  const toggleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      (productType === "all" || product.type === productType) &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let fieldA: any = a[sortField as keyof Product];
      let fieldB: any = b[sortField as keyof Product];
      
      // Handle null or undefined values
      if (fieldA == null) fieldA = "";
      if (fieldB == null) fieldB = "";
      
      if (typeof fieldA === "string") {
        if (sortDirection === "asc") {
          return fieldA.localeCompare(fieldB);
        } else {
          return fieldB.localeCompare(fieldA);
        }
      } else {
        if (sortDirection === "asc") {
          return fieldA - fieldB;
        } else {
          return fieldB - fieldA;
        }
      }
    });

  return (
    <div className="flex min-h-screen">
      <Sidebar items={adminSidebarItems} />
      
      <main className="flex-1 p-6 bg-gray-50">
        <h2 className="text-2xl font-bold mb-6">إدارة المنتجات</h2>
        
        <Tabs defaultValue="all" className="mb-6" onValueChange={setProductType}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all" className="flex items-center justify-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200">
                <span className="text-xs font-bold">{products.length}</span>
              </div>
              <span>جميع المنتجات</span>
            </TabsTrigger>
            <TabsTrigger value="ticket" className="flex items-center justify-center gap-2">
              <Ticket className="h-4 w-4" />
              <span>التذاكر</span>
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200">
                <span className="text-xs font-bold">{products.filter(p => p.type === "ticket").length}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="tshirt" className="flex items-center justify-center gap-2">
              <ShirtIcon className="h-4 w-4" />
              <span>التيشيرتات</span>
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200">
                <span className="text-xs font-bold">{products.filter(p => p.type === "tshirt").length}</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث عن منتج..."
                className="pr-10 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4" />
                  <span>إضافة منتج جديد</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>إضافة منتج جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="name">اسم المنتج</Label>
                        <Input 
                          id="name" 
                          name="name"
                          required 
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="description">وصف المنتج</Label>
                        <Textarea 
                          id="description" 
                          name="description"
                          rows={3} 
                          value={formData.description}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="price">السعر (بالنقاط)</Label>
                        <Input 
                          id="price" 
                          name="price"
                          type="number" 
                          required 
                          value={formData.price}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="type">نوع المنتج</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => handleSelectChange("type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع المنتج" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ticket">تذكرة</SelectItem>
                            <SelectItem value="tshirt">تيشيرت</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="category">الفئة</Label>
                        <Input 
                          id="category" 
                          name="category"
                          required 
                          value={formData.category}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-span-1">
                        <Label htmlFor="imageUrl">رابط الصورة</Label>
                        <Input 
                          id="imageUrl" 
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                        />
                      </div>
                      
                      {formData.type === "ticket" ? (
                        <>
                          <div className="col-span-1">
                            <Label htmlFor="eventDate">تاريخ الفعالية</Label>
                            <Input 
                              id="eventDate" 
                              name="eventDate"
                              type="date" 
                              value={formData.eventDate}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-span-1">
                            <Label htmlFor="eventLocation">مكان الفعالية</Label>
                            <Input 
                              id="eventLocation" 
                              name="eventLocation"
                              value={formData.eventLocation}
                              onChange={handleChange}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col-span-2">
                            <Label htmlFor="sizes">المقاسات المتاحة (مفصولة بفواصل)</Label>
                            <Input 
                              id="sizes" 
                              name="sizes"
                              placeholder="S, M, L, XL" 
                              value={formData.sizes}
                              onChange={handleChange}
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="col-span-1">
                        <Label htmlFor="stock">الكمية المتوفرة</Label>
                        <Input 
                          id="stock" 
                          name="stock"
                          type="number" 
                          disabled={formData.unlimited}
                          value={formData.stock}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="col-span-1 flex items-center pt-6">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <Checkbox 
                            id="unlimited" 
                            checked={formData.unlimited}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange("unlimited", checked as boolean)
                            }
                          />
                          <Label htmlFor="unlimited">متاح بدون حدود</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">إلغاء</Button>
                    </DialogClose>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      className="gap-2"
                    >
                      {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      إضافة المنتج
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Edit product dialog */}
          <Dialog open={editMode} onOpenChange={(open) => {
            if (!open) resetForm();
            setEditMode(open);
          }}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>تعديل المنتج</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="edit-name">اسم المنتج</Label>
                      <Input 
                        id="edit-name" 
                        name="name"
                        required 
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="edit-description">وصف المنتج</Label>
                      <Textarea 
                        id="edit-description" 
                        name="description"
                        rows={3} 
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="edit-price">السعر (بالنقاط)</Label>
                      <Input 
                        id="edit-price" 
                        name="price"
                        type="number" 
                        required 
                        value={formData.price}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="edit-category">الفئة</Label>
                      <Input 
                        id="edit-category" 
                        name="category"
                        required 
                        value={formData.category}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor="edit-imageUrl">رابط الصورة</Label>
                      <Input 
                        id="edit-imageUrl" 
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {formData.type === "ticket" ? (
                      <>
                        <div className="col-span-1">
                          <Label htmlFor="edit-eventDate">تاريخ الفعالية</Label>
                          <Input 
                            id="edit-eventDate" 
                            name="eventDate"
                            type="date" 
                            value={formData.eventDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor="edit-eventLocation">مكان الفعالية</Label>
                          <Input 
                            id="edit-eventLocation" 
                            name="eventLocation"
                            value={formData.eventLocation}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-2">
                          <Label htmlFor="edit-sizes">المقاسات المتاحة (مفصولة بفواصل)</Label>
                          <Input 
                            id="edit-sizes" 
                            name="sizes"
                            placeholder="S, M, L, XL" 
                            value={formData.sizes}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="col-span-1">
                      <Label htmlFor="edit-stock">الكمية المتوفرة</Label>
                      <Input 
                        id="edit-stock" 
                        name="stock"
                        type="number" 
                        disabled={formData.unlimited}
                        value={formData.stock}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="col-span-1 flex items-center pt-6">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <Checkbox 
                          id="edit-unlimited" 
                          checked={formData.unlimited}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange("unlimited", checked as boolean)
                          }
                        />
                        <Label htmlFor="edit-unlimited">متاح بدون حدود</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setEditMode(false);
                    resetForm();
                  }}>إلغاء</Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    className="gap-2"
                  >
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    حفظ التغييرات
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <TabsContent value="all" className="mt-0">
            <ProductsTable 
              products={filteredProducts} 
              isLoading={isLoading}
              isError={isError}
              sortField={sortField}
              sortDirection={sortDirection}
              toggleSort={toggleSort}
              onEdit={handleEditClick}
              onDelete={(id) => deleteMutation.mutate(id)}
              deleteLoading={deleteMutation.isPending}
            />
          </TabsContent>
          
          <TabsContent value="ticket" className="mt-0">
            <ProductsTable 
              products={filteredProducts} 
              isLoading={isLoading}
              isError={isError}
              sortField={sortField}
              sortDirection={sortDirection}
              toggleSort={toggleSort}
              onEdit={handleEditClick}
              onDelete={(id) => deleteMutation.mutate(id)}
              deleteLoading={deleteMutation.isPending}
            />
          </TabsContent>
          
          <TabsContent value="tshirt" className="mt-0">
            <ProductsTable 
              products={filteredProducts} 
              isLoading={isLoading}
              isError={isError}
              sortField={sortField}
              sortDirection={sortDirection}
              toggleSort={toggleSort}
              onEdit={handleEditClick}
              onDelete={(id) => deleteMutation.mutate(id)}
              deleteLoading={deleteMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  sortField: string;
  sortDirection: "asc" | "desc";
  toggleSort: (field: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  deleteLoading: boolean;
}

function ProductsTable({ 
  products, 
  isLoading, 
  isError,
  sortField,
  sortDirection,
  toggleSort,
  onEdit,
  onDelete,
  deleteLoading
}: ProductsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>لا توجد منتجات متاحة حالياً.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">الرقم</TableHead>
              <TableHead>
                <button 
                  className="flex items-center space-x-1 space-x-reverse"
                  onClick={() => toggleSort("name")}
                >
                  <span>اسم المنتج</span>
                  <ArrowUpDown className={`h-4 w-4 ${sortField === "name" ? "text-primary" : "text-gray-400"}`} />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <button 
                  className="flex items-center space-x-1 space-x-reverse"
                  onClick={() => toggleSort("category")}
                >
                  <span>الفئة</span>
                  <ArrowUpDown className={`h-4 w-4 ${sortField === "category" ? "text-primary" : "text-gray-400"}`} />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <button 
                  className="flex items-center space-x-1 space-x-reverse"
                  onClick={() => toggleSort("type")}
                >
                  <span>النوع</span>
                  <ArrowUpDown className={`h-4 w-4 ${sortField === "type" ? "text-primary" : "text-gray-400"}`} />
                </button>
              </TableHead>
              <TableHead className="text-center">
                <button 
                  className="flex items-center space-x-1 space-x-reverse"
                  onClick={() => toggleSort("price")}
                >
                  <span>السعر</span>
                  <ArrowUpDown className={`h-4 w-4 ${sortField === "price" ? "text-primary" : "text-gray-400"}`} />
                </button>
              </TableHead>
              <TableHead className="text-center hidden md:table-cell">
                <button 
                  className="flex items-center space-x-1 space-x-reverse"
                  onClick={() => toggleSort("stock")}
                >
                  <span>المخزون</span>
                  <ArrowUpDown className={`h-4 w-4 ${sortField === "stock" ? "text-primary" : "text-gray-400"}`} />
                </button>
              </TableHead>
              <TableHead className="text-center w-32">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-center">{product.id}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 shrink-0">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-400">
                          {product.type === 'ticket' ? (
                            <Ticket className="h-5 w-5" />
                          ) : (
                            <ShirtIcon className="h-5 w-5" />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {product.description || "لا يوجد وصف"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.category}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                    {product.type === 'ticket' ? (
                      <>
                        <Ticket className="h-3 w-3 mr-1" />
                        <span>تذكرة</span>
                      </>
                    ) : (
                      <>
                        <ShirtIcon className="h-3 w-3 mr-1" />
                        <span>تيشيرت</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold">
                  {product.price.toLocaleString()} نقطة
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  {product.unlimited ? (
                    <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      <span>غير محدود</span>
                    </span>
                  ) : product.stock ? (
                    <span className={`font-medium ${product.stock < 10 ? 'text-yellow-600' : ''}`}>
                      {product.stock}
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                      <X className="h-3 w-3 mr-1" />
                      <span>نفذت الكمية</span>
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(product.id)}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}