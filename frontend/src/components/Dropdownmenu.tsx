import { useNavigate } from "react-router-dom";
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
  slug: string;
}

interface DropdownMenuProps {
  closeDropdown: () => void;
}

const converters: ConverterItem[] = [
  { icon: <FileAudio className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />, label: "Audio Converter", slug: "audio" },
  { icon: <FileVideo className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />, label: "Video Converter", slug: "video" },
  { icon: <Image className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />, label: "Image Converter", slug: "image" },
  { icon: <FileText className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />, label: "Document Converter", slug: "document" },
  { icon: <Server className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />, label: "Archive Converter", slug: "archive" },
  { icon: <TabletSmartphone className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />, label: "Device Converter", slug: "device" },
  { icon: <Activity className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />, label: "Webservice Converter", slug: "webservice" },
  { icon: <BookOpen className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />, label: "Ebook Converter", slug: "ebook" },
  { icon: <Compass className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />, label: "Image Compressor", slug: "compressor" },
];

const Dropdownmenu: React.FC<DropdownMenuProps> = ({ closeDropdown }) => {
  const navigate = useNavigate();

  const handleNavigate = (slug: string) => {
    navigate(`/converter/${slug}`);
    closeDropdown();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3 w-full px-4 sm:px-6 py-4">
      {converters.map((item, index) => (
        <div
          key={index}
          onClick={() => handleNavigate(item.slug)}
          className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gray-50">
            {item.icon}
          </div>
          <span className="text-xs sm:text-sm lg:text-base font-medium text-gray-800">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Dropdownmenu;