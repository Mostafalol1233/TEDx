import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  TicketIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Twitter, 
  ShieldCheck, 
  CreditCard, 
  Heart, 
  MoveUp
} from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [scrollVisible, setScrollVisible] = useState(false);
  
  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real application, you would send this to your API
      alert("تم الاشتراك بنجاح! شكراً لك.");
      setEmail("");
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show/hide scroll to top button based on scroll position
  if (typeof window !== "undefined") {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        setScrollVisible(true);
      } else {
        setScrollVisible(false);
      }
    });
  }

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white pt-16 pb-8 relative">
      {/* Scroll to top button */}
      {scrollVisible && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all z-50 animate-bounce"
        >
          <MoveUp size={24} />
        </button>
      )}
      
      {/* Red divider at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500"></div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-12">
          {/* Logo and about section */}
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <div className="bg-red-600 text-white px-2 py-1 rounded font-bold text-sm">
                TEDx
              </div>
              <h2 className="text-xl font-bold text-white">Youth Red Sea STEM</h2>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              منصة حصرية لشراء تذاكر فعاليات TEDx Youth Red Sea STEM والمنتجات الحصرية. اكتشف أفكاراً جديدة وشارك في تجربة لا تُنسى مع أفضل المتحدثين الملهمين.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-red-500 transition bg-gray-800 p-2 rounded-full hover:bg-gray-700">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition bg-gray-800 p-2 rounded-full hover:bg-gray-700">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition bg-gray-800 p-2 rounded-full hover:bg-gray-700">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition bg-gray-800 p-2 rounded-full hover:bg-gray-700">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-5 text-white relative inline-block">
              روابط سريعة
              <span className="absolute bottom-0 left-0 w-2/3 h-0.5 bg-red-600"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-red-500 transition flex items-center">
                  <span className="ml-2 text-red-500">•</span>
                  <span>الرئيسية</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-red-500 transition flex items-center">
                  <span className="ml-2 text-red-500">•</span>
                  <span>التذاكر</span>
                </Link>
              </li>
              <li>
                <Link href="/tshirts" className="text-gray-400 hover:text-red-500 transition flex items-center">
                  <span className="ml-2 text-red-500">•</span>
                  <span>التيشيرتات</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-red-500 transition flex items-center">
                  <span className="ml-2 text-red-500">•</span>
                  <span>حسابي</span>
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-gray-400 hover:text-red-500 transition flex items-center">
                  <span className="ml-2 text-red-500">•</span>
                  <span>تسجيل الدخول</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-5 text-white relative inline-block">
              اتصل بنا
              <span className="absolute bottom-0 left-0 w-2/3 h-0.5 bg-red-600"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 space-x-reverse text-gray-400 hover:text-gray-300 transition">
                <MapPin className="h-5 w-5 mt-1 text-red-500 flex-shrink-0" />
                <span>مدرسة ريد سي ستيم، الغردقة، محافظة البحر الأحمر، مصر</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse text-gray-400 hover:text-gray-300 transition">
                <Phone className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span dir="ltr">+20 123 456 789</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse text-gray-400 hover:text-gray-300 transition">
                <Mail className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span>info@tedxyouthredseastem.com</span>
              </li>
            </ul>
            
            {/* Info Badges */}
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300">
                <ShieldCheck className="h-3 w-3 mr-1 text-green-500" />
                <span>دفع آمن</span>
              </div>
              <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300">
                <CreditCard className="h-3 w-3 mr-1 text-blue-500" />
                <span>نظام نقاط</span>
              </div>
              <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300">
                <Heart className="h-3 w-3 mr-1 text-red-500" />
                <span>دعم 24/7</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-5 text-white relative inline-block">
              النشرة الإخبارية
              <span className="absolute bottom-0 left-0 w-2/3 h-0.5 bg-red-600"></span>
            </h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              اشترك في نشرتنا الإخبارية للحصول على آخر الأخبار والعروض الخاصة حول الفعاليات القادمة ومنتجاتنا الحصرية.
            </p>
            <form onSubmit={handleSubscribe} className="flex mb-4">
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني" 
                className="bg-gray-800 text-white border-0 rounded-r-full focus-visible:ring-red-500 h-12" 
                required
              />
              <Button 
                type="submit" 
                className="rounded-l-full bg-red-600 hover:bg-red-700 h-12 px-6"
              >
                اشتراك
              </Button>
            </form>
            <p className="text-xs text-gray-500">
              بالاشتراك، أنت توافق على سياسة الخصوصية الخاصة بنا وتلقي رسائل بريد إلكتروني تسويقية
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-gray-500 text-sm md:text-right">
              © {new Date().getFullYear()} TEDxYouthRedSeaSTEM. جميع الحقوق محفوظة.
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end text-sm">
              <Link href="#" className="text-gray-500 hover:text-gray-300 transition">سياسة الخصوصية</Link>
              <Link href="#" className="text-gray-500 hover:text-gray-300 transition">شروط الاستخدام</Link>
              <Link href="#" className="text-gray-500 hover:text-gray-300 transition">سياسة الإرجاع</Link>
              <Link href="#" className="text-gray-500 hover:text-gray-300 transition">الأسئلة الشائعة</Link>
            </div>
          </div>
          <div className="text-xs text-gray-600 text-center mt-6">
            <p className="mb-2">
              This TEDx event is independently organized under license from TED.
            </p>
            <p className="mt-1">
              Made with ❤️ in Red Sea STEM School
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
