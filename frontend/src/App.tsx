import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import ConverterPage from "./pages/ConverterPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/converter/:slug" element={<ConverterPage />} />
    </Routes>
  );
}

export default App;
