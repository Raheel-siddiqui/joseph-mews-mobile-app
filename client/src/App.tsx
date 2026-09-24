import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import PropertyDetail from "./pages/PropertyDetail";
import ContentDetail from "./pages/ContentDetail";
import Documents from "./pages/Documents";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import ProjectDetail from "./pages/ProjectDetail";
import Calculator from "./pages/Calculator";
import CalculatorHome from "./pages/CalculatorHome";
import PreviewHub from "./pages/PreviewHub";
import EmptyDashboard from "./pages/preview/EmptyDashboard";
import PartialDashboard from "./pages/preview/PartialDashboard";
import EmptyPortfolio from "./pages/preview/EmptyPortfolio";
import EmptyDocuments from "./pages/preview/EmptyDocuments";
import EmptyExplore from "./pages/preview/EmptyExplore";
import EmptyCalculator from "./pages/preview/EmptyCalculator";
import { homePathForPersona, isInvestor } from "./lib/session";
import { ComponentType, useEffect } from "react";
import { toast } from "sonner";

/** Investor-only routes redirect prospects to their discovery home. */
function InvestorOnly({ component: Page }: { component: ComponentType }) {
  if (!isInvestor()) {
    return <Redirect to={homePathForPersona("prospect")} />;
  }
  return <Page />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard">
        {() => <InvestorOnly component={Dashboard} />}
      </Route>
      <Route path="/portfolio">
        {() => <InvestorOnly component={Portfolio} />}
      </Route>
      <Route path="/property/:id/content">
        {() => <InvestorOnly component={ContentDetail} />}
      </Route>
      <Route path="/property/:id">
        {() => <InvestorOnly component={PropertyDetail} />}
      </Route>
      <Route path="/documents">
        {() => <InvestorOnly component={Documents} />}
      </Route>
      <Route path="/profile" component={Profile} />
      <Route path="/explore" component={Explore} />
      <Route path="/explore/:id/content" component={ContentDetail} />
      <Route path="/explore/:id" component={ProjectDetail} />
      <Route path="/calculator/:source/:id" component={Calculator} />
      <Route path="/calculator" component={CalculatorHome} />
      <Route path="/preview/dashboard-partial" component={PartialDashboard} />
      <Route path="/preview/dashboard" component={EmptyDashboard} />
      <Route path="/preview/portfolio" component={EmptyPortfolio} />
      <Route path="/preview/documents" component={EmptyDocuments} />
      <Route path="/preview/explore" component={EmptyExplore} />
      <Route path="/preview/calculator" component={EmptyCalculator} />
      <Route path="/preview" component={PreviewHub} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ToastBridge() {
  useEffect(() => {
    const handler = () => {
      toast("Coming soon", {
        description: "This feature is part of an upcoming release.",
      });
    };
    window.addEventListener("toast-coming-soon", handler);
    return () => window.removeEventListener("toast-coming-soon", handler);
  }, []);
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: "#1C1C1C",
                border: "1px solid rgba(245, 241, 232, 0.08)",
                color: "#F5F1E8",
                fontFamily: "Inter, sans-serif",
              },
            }}
          />
          <ToastBridge />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
