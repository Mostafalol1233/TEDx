import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ProductDetail from "@/pages/product-detail";
import EventsPage from "@/pages/events-page";
import TshirtsPage from "@/pages/tshirts-page";
import MessagesPage from "@/pages/messages-page";
import PointTransferPage from "@/pages/point-transfer-page";
import ProfilePage from "@/pages/profile-page";
import AdminProductsPage from "@/pages/admin/products";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { WebSocketProvider } from "./hooks/use-websocket";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/tshirts" component={TshirtsPage} />
          <Route path="/product/:id">
            {params => <ProductDetail id={parseInt(params.id)} />}
          </Route>
          <ProtectedRoute path="/dashboard" component={UserDashboard} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/messages" component={MessagesPage} />
          <ProtectedRoute path="/points" component={PointTransferPage} />
          <ProtectedRoute 
            path="/admin" 
            component={AdminDashboard}
            isAdminRoute={true}
          />
          <ProtectedRoute 
            path="/admin/products" 
            component={AdminProductsPage}
            isAdminRoute={true}
          />
          <ProtectedRoute 
            path="/admin/users" 
            component={() => <div className="p-8 text-center">صفحة إدارة المستخدمين - قيد التطوير</div>}
            isAdminRoute={true}
          />
          <ProtectedRoute 
            path="/admin/reports" 
            component={() => <div className="p-8 text-center">صفحة التقارير - قيد التطوير</div>}
            isAdminRoute={true}
          />
          <ProtectedRoute 
            path="/admin/settings" 
            component={() => <div className="p-8 text-center">صفحة الإعدادات - قيد التطوير</div>}
            isAdminRoute={true}
          />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <WebSocketProvider>
            <AppRoutes />
          </WebSocketProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
