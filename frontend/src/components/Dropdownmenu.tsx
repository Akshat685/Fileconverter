import {
  FileAudio,
  FileVideo,
  Image,
  FileText,
  Server,
  TabletSmartphone,
  BookOpen,
  Compass,
  Activity,
} from "lucide-react";
import React from "react";

interface ConverterItem {
  icon: React.ReactElement;
  label: string;
}

const converters: ConverterItem[] = [
  { icon: <FileAudio className="text-red-500 w-6 h-6" />, label: "Audio Converter" },
  { icon: <FileVideo className="text-red-500 w-6 h-6" />, label: "Video Converter" },
  { icon: <Image className="text-red-500 w-6 h-6" />, label: "Image Converter" },
  { icon: <FileText className="text-red-500 w-6 h-6" />, label: "Document Converter" },
  { icon: <Server className="text-red-500 w-6 h-6" />, label: "Archive Converter" },
  { icon: <TabletSmartphone className="text-red-500 w-6 h-6" />, label: "Device Converter" },
  { icon: <Activity className="text-red-500 w-6 h-6" />, label: "Webservice Converter" },
  { icon: <BookOpen className="text-red-500 w-6 h-6" />, label: "Ebook Converter" },
  { icon: <Compass className="text-red-500 w-6 h-6" />, label: "Image Compressor" },
];

const Dropdownmenu = () => {
  return (
    <div className="grid grid-cols-3 gap-y-4 w-full p-4">
      {converters.map((item, index) => (
        <div key={index} className="flex items-center space-x-4   p-2">
          <div className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full bg-gray-50">
            {item.icon}
          </div>
          <span className="text-sm font-medium text-gray-800">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Dropdownmenu;