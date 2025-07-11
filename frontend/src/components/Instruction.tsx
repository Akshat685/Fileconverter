// src/components/Instructions.tsx
import React from "react";

interface InstructionsProps {
  converterType: string;
}

const Instructions: React.FC<InstructionsProps> = ({ converterType }) => {
  const getInstructionTitle = () => {
    return `How to use ${converterType}?`;
  };

  const getInstructions = () => {
    if (converterType.toLowerCase().includes("converter")) {
      const baseType = converterType.replace(" Converter", "").toLowerCase();

      switch (baseType) {
        case "audio":
          return [
            'Click the "Choose Files" button to select your audio files (up to 20 files at a time)',
            "Select the output format for your audio files",
            'Click on the "Convert" button to start the audio conversion',
            'When the status changes to "Done", click the "Download" button to get your converted audio files',
          ];
        case "video":
          return [
            'Click the "Choose Files" button to select your video files (up to 20 files at a time)',
            "Choose the desired output format for your video files",
            'Click on the "Convert" button to start the video conversion',
            'When the status changes to "Done", click the "Download" button to get your converted video files',
          ];
        case "image":
          return [
            'Click the "Choose Files" button to select your image files (up to 20 files at a time)',
            "Select the target image format for conversion",
            'Click on the "Convert" button to start the image conversion',
            'When the status changes to "Done", click the "Download" button to get your converted images',
          ];
        case "document":
          return [
            'Click the "Choose Files" button to select your document files (up to 20 files at a time)',
            "Choose the output document format you need",
            'Click on the "Convert" button to start the document conversion',
            'When the status changes to "Done", click the "Download" button to get your converted documents',
          ];
        case "archive":
          return [
            'Click the "Choose Files" button to select your archive files (up to 20 files at a time)',
            "Select the desired archive format for conversion",
            'Click on the "Convert" button to start the archive conversion',
            'When the status changes to "Done", click the "Download" button to get your converted archives',
          ];
        case "device":
          return [
            'Click the "Choose Files" button to select your files (up to 20 files at a time)',
            "Choose your target device or device-specific format",
            'Click on the "Convert" button to start the device-optimized conversion',
            'When the status changes to "Done", click the "Download" button to get your device-compatible files',
          ];
        case "webservice":
          return [
            'Click the "Choose Files" button to select your files (up to 20 files at a time)',
            "Select the web service format you need",
            'Click on the "Convert" button to start the web service conversion',
            'When the status changes to "Done", click the "Download" button to get your converted files',
          ];
        case "ebook":
          return [
            'Click the "Choose Files" button to select your ebook files (up to 20 files at a time)',
            "Choose the target ebook format (EPUB, PDF, MOBI, etc.)",
            'Click on the "Convert" button to start the ebook conversion',
            'When the status changes to "Done", click the "Download" button to get your converted ebooks',
          ];
        case "compressor":
          return [
            'Click the "Choose Files" button to select your image files (up to 20 files at a time)',
            "Adjust compression settings if needed",
            'Click on the "Compress" button to start the image compression',
            'When the status changes to "Done", click the "Download" button to get your compressed images',
          ];
      }
    }

    return [
      'Click the "Choose Files" button to select your files (up to 20 files at a time)',
      "Select the output format for your files",
      'Click on the "Convert" button to start the conversion',
      'When the status changes to "Done", click the "Download" button',
    ];
  };

  return (
    <div className="max-w-3xl mx-auto bg-white px-8 py-10 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.15)]">
      <h2 className="text-[28px] font-[600] text-center mb-6 text-black">
        {getInstructionTitle()}
      </h2>
      <ol className="space-y-3 text-[18px] text-[#1a1a1a]">
        {getInstructions().map((instruction, index) => (
          <li key={index}>
            {index + 1}. {instruction}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Instructions;
