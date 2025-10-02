export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-4 text-center text-gray-500">
        <p>&copy; {currentYear} Paulo Ney Veículos. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}