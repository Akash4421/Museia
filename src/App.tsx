import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Museums from "./pages/Museums.tsx";
import MuseumDetail from "./pages/MuseumDetail.tsx";
import Shows from "./pages/Shows.tsx";
import Exhibitions from "./pages/Exhibitions.tsx";
import Custom from "./pages/Custom.tsx";
import Book from "./pages/Book.tsx";
import Ticket from "./pages/Ticket.tsx";
import Dashboard from "./pages/Dashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/museums" element={<Museums />} />
          <Route path="/museums/:id" element={<MuseumDetail />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/custom" element={<Custom />} />
          <Route path="/book" element={<Book />} />
          <Route path="/ticket/:id" element={<Ticket />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
