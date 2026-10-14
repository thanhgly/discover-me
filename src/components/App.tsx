import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./Nav";
import Home from "./Home";
import Contact from "./Contact";
import Footer from "./Footer";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-dvh flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
