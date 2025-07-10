// src/pages/Homepage.tsx

import Navbar from "../components/Navbar";
import Dropbox from "../components/Dropbox";
import Features from "../components/Features";
import Footer from "../components/Footer";
import FileConverter from "../components/Fileconverter";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      {/* Hero Section (Heading) */}
      <div className="text-center py-5">
        <h1 className="text-[48px] font-[700] text-[#ec2d3f] mb-4">
          File Converter
        </h1>
        <p className="text-[19px] font-[400] text-[#000]">
          Convert your files to any format
        </p>
      </div>

      <Dropbox />
      <Features />
        <FileConverter />
      <Footer />
    </div>
  );
};

export default Homepage;
