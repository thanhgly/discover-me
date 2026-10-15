import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Nav from "./Nav";
import Home from "./Home";
import Contact from "./Contact";
import Footer from "./Footer";
import ChatProvider from "./ChatProvider";

// Keeps the build-time canonical and og:url pointing at the current route.
const CanonicalUrl = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    for (const el of document.querySelectorAll<HTMLElement>(
      'link[rel="canonical"], meta[property="og:url"]',
    )) {
      const attr = el.tagName === "LINK" ? "href" : "content";
      const current = el.getAttribute(attr);
      if (current) el.setAttribute(attr, new URL(pathname, current).href);
    }
  }, [pathname]);
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <CanonicalUrl />
      <ChatProvider>
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
      </ChatProvider>
    </BrowserRouter>
  );
}

export default App;
