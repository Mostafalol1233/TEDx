import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TicketIcon, MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <div className="bg-red-600 text-white px-2 py-1 rounded font-bold text-sm">
                TEDx
              </div>
              <h2 className="text-xl font-bold text-white">Youth Red Sea STEM</h2>
            </div>
            <p className="text-gray-400 mb-4">منصة رسمية لبيع تذاكر فعالية TEDx Youth Red Sea STEM والمنتجات الحصرية باستخدام نظام النقاط</p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="https://www.facebook.com/TEDxYouthRedSeaSTEM/" target="_blank" className="text-gray-400 hover:text-red-500 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/tedx_youthmaadistem/" target="_blank" className="text-gray-400 hover:text-red-500 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/mostafa-mohamed-409540336/" target="_blank" className="text-gray-400 hover:text-red-500 transition">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-red-500 transition">الرئيسية</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-red-500 transition">التذاكر</Link></li>
              <li><Link href="/tshirts" className="text-gray-400 hover:text-red-500 transition">التيشيرتات</Link></li>
              <li><Link href="/auth" className="text-gray-400 hover:text-red-500 transition">تسجيل الدخول</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">اتصل بنا</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 space-x-reverse text-gray-400">
                <MapPin className="h-5 w-5 text-red-500" />
                <span>الغردقة، محافظة البحر الأحمر، مصر</span>
              </li>
              <li className="flex items-center space-x-2 space-x-reverse text-gray-400">
                <Phone className="h-5 w-5 text-red-500" />
                <span>+20 123 456 789</span>
              </li>
              <li className="flex items-center space-x-2 space-x-reverse text-gray-400">
                <Mail className="h-5 w-5 text-red-500" />
                <span>info@tedxyouthredseastem.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">النشرة الإخبارية</h3>
            <p className="text-gray-400 mb-4">اشترك في نشرتنا الإخبارية للحصول على آخر الأخبار والعروض</p>
            <form className="flex">
              <Input 
                type="email" 
                placeholder="بريدك الإلكتروني" 
                className="bg-gray-800 text-white border-0 rounded-r-lg focus:ring-red-500" 
              />
              <Button type="submit" className="rounded-l-lg bg-red-600 hover:bg-red-700">
                اشتراك
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} All Rights Reserved | TEDxYouthRedSeaSTEM</p>
        </div>
      </div>
    </footer>
  );
}
