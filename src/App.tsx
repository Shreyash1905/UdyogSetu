import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProductionEntry from "./pages/ProductionEntry";
import Tasks from "./pages/Tasks";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import UsersPage from "./pages/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/production" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor', 'worker']}>
                  <ProductionEntry />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor', 'worker']}>
                  <Tasks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <Inventory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
