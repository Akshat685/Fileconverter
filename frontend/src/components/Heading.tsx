import React from "react";

interface HeadingProps {
  selectedConverter: string | null;
  description?: string;
}

const Heading: React.FC<HeadingProps> = ({ selectedConverter, description }) => {
  const getHeadingText = () => {
    if (!selectedConverter) return "File Converter";

    switch (selectedConverter) {
      case "Audio Converter":
        return "Audio Converter";
      case "Video Converter":
        return "Video Converter";
      case "Image Converter":
        return "Image Converter";
      case "Document Converter":
        return "Document Converter";
      case "Archive Converter":
        return "Archive Converter";
      case "Device Converter":
        return "Device Converter";
      case "Webservice Converter":
        return "Webservice Converter";
      case "Ebook Converter":
        return "Ebook Converter";
      case "Image Compressor":
        return "Image Compressor";
      default:
        return selectedConverter; // dynamic like "MP3 to WAV Converter"
    }
  };

  const getSubtitleText = () => {
    if (!selectedConverter) return "Convert your files to any format";

    switch (selectedConverter) {
      case "Audio Converter":
        return "Convert your audio files to any format";
      case "Video Converter":
        return "Convert your video files to any format";
      case "Image Converter":
        return "Convert your image files to any format";
      case "Document Converter":
        return "Convert your document files to any format";
      case "Archive Converter":
        return "Convert your archive files to any format";
      case "Device Converter":
        return "Convert files for your devices";
      case "Webservice Converter":
        return "Convert files using web services";
      case "Ebook Converter":
        return "Convert your ebook files to any format";
      case "Image Compressor":
        return "Compress your images efficiently";
      default:
        return description || "Convert your files quickly and securely";
    }
  };

  return (
    <div className="text-center py-5">
      <h1 className="text-[48px] font-[700] text-[#ec2d3f] mb-4">
        {getHeadingText()}
      </h1>
      <p className="text-[19px] font-[400] text-[#000]">
        {getSubtitleText()}
      </p>
    </div>
  );
};

export default Heading;
