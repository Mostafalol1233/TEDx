import { useState, memo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, TicketIcon } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "الرئيسية", href: "/" },
    { name: "التذاكر", href: "/events" },
    { name: "التيشيرتات", href: "/tshirts" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="bg-red-600 text-white px-1 rounded">
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
                className={`text-gray-800 hover:text-primary transition mx-4 ${
                  location === item.href ? "text-primary font-medium" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User Controls */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {user && (
              <div className="hidden md:flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                <span className="font-medium text-primary">{user.points}</span>
                <span className="mr-1">نقطة</span>
              </div>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer border-2 border-primary">
                    <AvatarImage src="https://github.com/shadcn.png" alt={user.name || user.username} />
                    <AvatarFallback>{user.name?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full">الصفحة الشخصية</Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full">لوحة الإدارة</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="w-full">الرسائل</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/points" className="w-full">تحويل النقاط</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/auth">تسجيل الدخول</Link>
              </Button>
            )}
            
            <button 
              className="md:hidden text-gray-700 hover:text-primary text-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-gray-800 hover:text-primary transition ${
                    location === item.href ? "text-primary font-medium" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-max">
                  <span className="font-medium text-primary">{user.points}</span>
                  <span className="mr-1">نقطة</span>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
