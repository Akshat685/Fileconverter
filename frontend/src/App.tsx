import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import ContactPage from "./pages/ContactPage";
import ConverterPage from "./pages/ConverterPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/converter/:slug" element={<ConverterPage />} />
      <Route path="/contactpage" element={<ContactPage />} />
      <Route path="/aboutpage" element={<AboutPage />} />
      <Route path="/blogpage" element={<BlogPage />} />
    </Routes>
  );
}

export default App;
