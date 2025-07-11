import Navbar from "../components/Navbar";
import Dropbox from "../components/Dropbox";
import Features from "../components/Features";
import Footer from "../components/Footer";
import FileConverter from "../components/Fileconverter";
import Heading from "../components/Heading";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <Heading selectedConverter={null} />
      <Dropbox />
      <Features />
      <FileConverter />
      <Footer />
    </div>
  );
};

export default Homepage;
