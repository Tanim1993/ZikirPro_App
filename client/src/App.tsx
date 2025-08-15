import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import NotFound from "./pages/not-found";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import OrganizationDashboard from "./pages/organization-dashboard";
import Room from "./pages/room";
import Profile from "./pages/profile";
import Stats from "./pages/stats";
import Rooms from "./pages/rooms";
import Leaderboard from "./pages/leaderboard";
import MobileNav from "./components/mobile-nav";
import OrganizationSearch from "./pages/organization-search";
import More from "./pages/more";
import SalahTracker from "./pages/salah-tracker";
import Quran from "./pages/quran";
import QuranReader from "./pages/quran-reader";
import Hadith from "./pages/hadith";
import ZakatCalculator from "./pages/zakat-calculator";
import Qiblah from "./pages/qiblah";
import Donations from "./pages/donations";
import OfflineDemo from "./pages/offline-demo";
import SeasonalCompetitions from "./pages/seasonal-competitions";
import AdminDashboard from "./pages/admin-dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin">
            <div className="w-full h-full border-4 border-islamic-secondary/30 border-t-islamic-primary rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/organizations" component={OrganizationSearch} />
          </>
        ) : (user as any)?.userType === 'organization' ? (
          <>
            <Route path="/" component={OrganizationDashboard} />
            <Route path="/dashboard" component={OrganizationDashboard} />
            <Route path="/room/:id" component={Room} />
            <Route path="/profile" component={Profile} />
            <Route path="/organizations" component={OrganizationSearch} />
          </>
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/room/:id" component={Room} />
            <Route path="/profile" component={Profile} />
            <Route path="/create" component={Dashboard} />
            <Route path="/stats" component={Stats} />
            <Route path="/rooms" component={Rooms} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/organizations" component={OrganizationSearch} />
            <Route path="/more" component={More} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/salah-tracker" component={SalahTracker} />
            <Route path="/quran" component={Quran} />
            <Route path="/quran/reader/:surahId?" component={QuranReader} />
            <Route path="/hadith" component={Hadith} />
            <Route path="/zakat-calculator" component={ZakatCalculator} />
            <Route path="/qiblah" component={Qiblah} />
            <Route path="/donations" component={Donations} />
            <Route path="/offline-demo" component={OfflineDemo} />
            <Route path="/seasonal-competitions" component={SeasonalCompetitions} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      
      {/* Mobile Navigation - only show when authenticated */}
      {isAuthenticated && <MobileNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
