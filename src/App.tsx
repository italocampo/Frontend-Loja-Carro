import { Routes, Route } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import {Toaster} from "react-hot-toast";
import { Catalogo } from "./pages/Catalogo";
import { Login } from "./pages/Login";
import { Admin } from "./pages/Admin";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CarForm } from "./pages/CarForm";
import { CarDetail } from "./pages/CarDetail";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Toaster position="top-right" />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Catalogo />} />
          <Route path="/carros/:id" element={<CarDetail />} /> 
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          
          {/* 2. Novas rotas adicionadas */}
          <Route
            path="/admin/carros/novo"
            element={
              <ProtectedRoute>
                <CarForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/carros/editar/:id"
            element={
              <ProtectedRoute>
                <CarForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;