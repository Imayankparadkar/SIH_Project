import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from 'react-i18next';
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { HealthProvider } from "@/context/health-context";
import { Navigation } from "@/components/layout/navigation";
import { LandingPage } from "@/pages/landing";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Dashboard } from "@/pages/dashboard";
import { ProfilePage } from "@/pages/profile";
import { DoctorsPage } from "@/pages/doctors";
import { DonationsPage } from "@/pages/donations";
import NotFound from "@/pages/not-found";
import i18n from "@/lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginForm} />
      <Route path="/register" component={RegisterForm} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/doctors" component={DoctorsPage} />
      <Route path="/donations" component={DonationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <AuthProvider>
            <HealthProvider>
              <AppContent />
              <Toaster />
            </HealthProvider>
          </AuthProvider>
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
