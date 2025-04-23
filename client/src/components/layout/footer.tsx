import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TicketIcon, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <TicketIcon className="text-primary h-6 w-6" />
              <h2 className="text-2xl font-bold text-white">TickTee</h2>
            </div>
            <p className="text-gray-400 mb-4">منصة رقمية لبيع التذاكر والتيشيرتات باستخدام نظام النقاط</p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-primary transition">الرئيسية</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-primary transition">التذاكر</Link></li>
              <li><Link href="/tshirts" className="text-gray-400 hover:text-primary transition">التيشيرتات</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-primary transition">حول المنصة</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-primary transition">سياسة الخصوصية</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">اتصل بنا</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 space-x-reverse text-gray-400">
                <MapPin className="h-5 w-5 text-primary" />
                <span>شارع التحرير، القاهرة، مصر</span>
              </li>
              <li className="flex items-center space-x-2 space-x-reverse text-gray-400">
                <Phone className="h-5 w-5 text-primary" />
                <span>+20 123 456 789</span>
              </li>
              <li className="flex items-center space-x-2 space-x-reverse text-gray-400">
                <Mail className="h-5 w-5 text-primary" />
                <span>info@ticktee.com</span>
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
                className="bg-gray-700 text-white border-0 rounded-r-lg focus:ring-primary" 
              />
              <Button type="submit" className="rounded-l-lg">
                اشتراك
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} TickTee. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
