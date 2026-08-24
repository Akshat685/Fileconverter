import Navbar from "../components/Navbar";
import Dropbox from "../components/Dropbox";
import Features from "../components/Features";
import Footer from "../components/Footer";
import FileConverter from "../components/Fileconverter";
import Heading from "../components/Heading";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Heading selectedConverter={null} />
        <Dropbox />
        <Features />
        <FileConverter />
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;
