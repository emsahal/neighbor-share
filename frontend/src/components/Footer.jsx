function Footer() {
    return (
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 NeighborShare. All rights reserved.</p>
          <div className="mt-2">
            <a href="/about" className="mx-2 hover:underline">About</a>
            <a href="/terms" className="mx-2 hover:underline">Terms</a>
            <a href="/contact" className="mx-2 hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    );
  }
  
  export default Footer;