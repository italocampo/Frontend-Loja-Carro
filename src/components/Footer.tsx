import { MapPin, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
  
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-6 text-center">
        {/* Informações de contato */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>Avenida José Bastos, 14748 - Fortaleza/CE</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} />
            <a href="tel:+5585996469560" className="hover:text-white">(85) 99646-9560</a>
          </div>
        </div>

        {/* Linha do copyright */}
        <p className="text-sm text-gray-400">&copy; {currentYear} Paulo Ney Veículos. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}