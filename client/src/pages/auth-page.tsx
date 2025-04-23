import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";

// Login schema extends the base insertUserSchema with just username and password
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration schema extends the base insertUserSchema with additional validation
const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
    },
  });

  // Handle login form submission
  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  // Handle register form submission
  function onRegisterSubmit(data: RegisterFormValues) {
    // Remove confirmPassword as it's not part of the schema
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  }

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Left side - Forms */}
        <div className="w-full max-w-md">
          <Card>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register">إنشاء حساب جديد</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardHeader>
                    <CardTitle>تسجيل الدخول</CardTitle>
                    <CardDescription>
                      قم بتسجيل الدخول للوصول إلى حسابك ومتابعة طلباتك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">اسم المستخدم</Label>
                      <Input 
                        id="login-username" 
                        placeholder="أدخل اسم المستخدم" 
                        {...loginForm.register("username")}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">كلمة المرور</Label>
                        <a href="#" className="text-sm text-primary hover:underline">
                          نسيت كلمة المرور؟
                        </a>
                      </div>
                      <Input 
                        id="login-password" 
                        type="password" 
                        placeholder="أدخل كلمة المرور" 
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "جاري التسجيل..." : "تسجيل الدخول"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardHeader>
                    <CardTitle>إنشاء حساب جديد</CardTitle>
                    <CardDescription>
                      قم بإنشاء حساب جديد للشراء وحفظ معلوماتك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">الاسم</Label>
                      <Input 
                        id="register-name" 
                        placeholder="أدخل اسمك الكامل" 
                        {...registerForm.register("name")}
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">البريد الإلكتروني</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="أدخل بريدك الإلكتروني" 
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-username">اسم المستخدم</Label>
                      <Input 
                        id="register-username" 
                        placeholder="أدخل اسم المستخدم" 
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">كلمة المرور</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="أدخل كلمة المرور" 
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">تأكيد كلمة المرور</Label>
                      <Input 
                        id="register-confirm-password" 
                        type="password" 
                        placeholder="أعد إدخال كلمة المرور" 
                        {...registerForm.register("confirmPassword")}
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "جاري التسجيل..." : "إنشاء حساب"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        {/* Right side - Hero */}
        <div className="w-full max-w-md p-6 tedx-gradient text-white rounded-lg">
          <h2 className="text-3xl font-bold mb-4">TEDx Youth Red Sea STEM</h2>
          <p className="mb-6">
            منصة رسمية لفعالية TEDx Youth Red Sea STEM لشراء التذاكر والمنتجات الحصرية باستخدام نظام النقاط.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>تذاكر حصرية للفعالية</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>تيشيرتات بشعار TEDx الرسمي</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>ورش عمل إبداعية متخصصة</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>مشاركة نخبة من المتحدثين الملهمين</span>
            </li>
          </ul>
          <div className="mt-8 text-xs">
            <p>15-16 ديسمبر 2023 | مدرسة ريد سي ستيم، القاهرة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
