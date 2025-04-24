import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  X, 
  TicketIcon, 
  User, 
  LogOut, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  Home, 
  ShoppingBag, 
  ShirtIcon, 
  BarChart3, 
  Users, 
  Bell, 
  PackageCheck, 
  SlidersHorizontal 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Main navigation items
  const navigation = [
    { name: "الرئيسية", href: "/", icon: <Home className="mr-2 h-4 w-4" /> },
    { name: "التذاكر", href: "/events", icon: <TicketIcon className="mr-2 h-4 w-4" /> },
    { name: "التيشيرتات", href: "/tshirts", icon: <ShirtIcon className="mr-2 h-4 w-4" /> },
  ];
  
  // Admin navigation items
  const adminNavigation = [
    { name: "المنتجات", href: "/admin/products", icon: <PackageCheck className="mr-2 h-4 w-4" /> },
    { name: "المستخدمون", href: "/admin/users", icon: <Users className="mr-2 h-4 w-4" /> },
    { name: "التقارير", href: "/admin/reports", icon: <BarChart3 className="mr-2 h-4 w-4" /> },
    { name: "الإعدادات", href: "/admin/settings", icon: <SlidersHorizontal className="mr-2 h-4 w-4" /> },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-md py-2' : 'py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-red-600 text-white px-1.5 py-0.5 rounded">
              <span className="text-lg font-bold tracking-tighter">TEDx</span>
            </div>
            <Link href="/">
              <h1 className="text-xl font-bold cursor-pointer">
                <span className="text-red-600">Youth</span> 
                <span className="text-gray-800"> Red Sea STEM</span>
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center text-gray-700 hover:text-red-600 transition mx-5 ${
                  location === item.href ? "text-red-600 font-medium" : ""
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User Controls */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {user && (
              <div className="hidden md:flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm shadow-sm">
                <span className="font-medium">{user.points || 0}</span>
                <span className="mr-1">نقطة</span>
              </div>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center">
                    <Avatar className="cursor-pointer border-2 border-red-500 hover:border-red-600 transition-colors">
                      <AvatarImage src="https://i.imgur.com/vnjCsWA.jpg" alt={user.name || user.username} />
                      <AvatarFallback className="bg-red-500 text-white">{user.name?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {user.isAdmin && (
                      <Badge variant="outline" className="border-red-500 text-red-500 absolute -bottom-2 -right-2 text-[10px]">
                        مشرف
                      </Badge>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="flex flex-col items-center justify-center mb-2 pb-2 border-b">
                    <Avatar className="h-16 w-16 mb-2">
                      <AvatarImage src="https://i.imgur.com/vnjCsWA.jpg" alt={user.name || user.username} />
                      <AvatarFallback className="bg-red-500 text-white">{user.name?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold">{user.name || user.username}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>الصفحة الشخصية</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="w-full flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>الرسائل</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/points" className="w-full flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>تحويل النقاط</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">لوحة الإدارة</div>
                      
                      {adminNavigation.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link href={item.href} className="w-full flex items-center">
                            {item.icon}
                            <span>{item.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="flex items-center text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
                <Link href="/auth">تسجيل الدخول</Link>
              </Button>
            )}
            
            <button 
              className="md:hidden text-gray-700 hover:text-red-600 text-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t mt-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center text-gray-700 hover:text-red-600 transition-colors py-2 ${
                    location === item.href ? "text-red-600 font-medium" : ""
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {user && (
                <>
                  <div className="border-t border-b py-3 my-2">
                    <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                      <span className="font-medium text-red-600">{user.points || 0}</span>
                      <span className="mr-1">نقطة</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center text-gray-700 hover:text-red-600 transition-colors py-2"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>الصفحة الشخصية</span>
                  </Link>
                  
                  {user.isAdmin && (
                    <>
                      <div className="py-1 font-semibold text-gray-500">لوحة الإدارة</div>
                      {adminNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center text-gray-700 hover:text-red-600 transition-colors py-2 pr-3"
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      logoutMutation.mutate();
                      setMobileMenuOpen(false);
                    }}
                    disabled={logoutMutation.isPending}
                    className="flex items-center text-red-500 hover:text-red-600 transition-colors py-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
