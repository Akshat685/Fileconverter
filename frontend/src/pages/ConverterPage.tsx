// src/pages/ConverterPage.tsx

import { useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Instructions from "../components/Instruction";
import Heading from "../components/Heading";
import Dropbox from "../components/Dropbox";
import Features from "../components/Features";
import RelatedTools from "../components/RelatedTools";
import Footer from "../components/Footer";

const ConverterPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const fromFileConverter = location.state?.fromFileConverter || false;

  useEffect(() => {
    console.log("🚀 Loaded ConverterPage with slug:", slug);

    // Scroll to top if navigated from FileConverters
    if (fromFileConverter) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug, fromFileConverter]);

  const formatSlugToTitle = (slug: string): string => {
    return slug
      .split("-")
      .map((word) =>
        word.toLowerCase() === "to"
          ? "to"
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  const slugToConverterLabel = (slug: string | undefined): string => {
    switch (slug) {
      case "audio":
        return "Audio Converter";
      case "video":
        return "Video Converter";
      case "image":
        return "Image Converter";
      case "document":
        return "Document Converter";
      case "archive":
        return "Archive Converter";
      case "device":
        return "Device Converter";
      case "webservice":
        return "Webservice Converter";
      case "ebook":
        return "Ebook Converter";
      case "compressor":
        return "Image Compressor";
      default:
        return slug ? `${formatSlugToTitle(slug)} Converter` : "File Converter";
    }
  };

  const converterLabel = slugToConverterLabel(slug);
  const description = slug
    ? `Convert ${formatSlugToTitle(slug)} online at Convertig.com. Fast, free, and secure converter — no software needed. Upload your file and get output instantly.`
    : "Convert files online at Convertig.com. Fast, free, and secure — no software needed.";

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <Heading selectedConverter={converterLabel} description={description} />
      <Dropbox />
      <Features />
      <Instructions converterType={converterLabel} />
      {fromFileConverter && <RelatedTools />}
      <Footer />
    </div>
  );
};

export default ConverterPage;
