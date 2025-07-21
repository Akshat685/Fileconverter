import React, { useState } from 'react';
import {
  ChevronDown,
  Music,
  Video,
  Archive,
  Book,
  Image,
  
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ✅ import navigate

const FileConverters = () => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const navigate = useNavigate(); // ✅ for navigation

  interface ConverterOption {
    icon: React.ReactNode;
    title: string;
  }

  interface Converter {
    id: string;
    title: string;
    icon: React.ReactNode;
    options: ConverterOption[];
  }

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const converters: Converter[] = [
    {
      id: 'audio',
      title: 'Audio Converter',
      icon: <Music className="w-5 h-5 sm:w-6 sm:h-6" />,
      options: [
        { icon: <Music className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'MP3 to WAV' },
        { icon: <Music className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'WAV to MP3' },
        { icon: <Music className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'AAC to MP3' },
        { icon: <Music className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'FLAC to MP3' },
      ],
    },
    {
      id: 'video',
      title: 'Video Converter',
      icon: <Video className="w-5 h-5 sm:w-6 sm:h-6" />,
      options: [
        { icon: <Video className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'MP4 to MP3' },
        { icon: <Video className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'AVI to MP4' },
        { icon: <Video className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'MOV to MP4' },
        { icon: <Video className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'WEBM to MP4' },
      ],
    },
    {
      id: 'archive',
      title: 'Archive Converter',
      icon: <Archive className="w-5 h-5 sm:w-6 sm:h-6" />,
      options: [
        { icon: <Archive className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'ZIP to TAR.GZ' },
        { icon: <Archive className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'TAR.GZ to ZIP' },
        { icon: <Archive className="w-4 h-4 sm:w-5 sm:h-5" />, title: '7Z to ZIP' },
        { icon: <Archive className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'TAR to ZIP' },
      ],
    },
    {
      id: 'ebook',
      title: 'Ebook Converter',
      icon: <Book className="w-5 h-5 sm:w-6 sm:h-6" />, 
      options: [
        { icon: <Book className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'EPUB to PDF' },
        { icon: <Book className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'MOBI to PDF' },
        { icon: <Book className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'PDF to EPUB' },
        { icon: <Book className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'AZW3 to PDF' },
      ],
    },
    {
      id: 'image',
      title: 'Image Converter',
      icon: <Image className="w-5 h-5 sm:w-6 sm:h-6" />,
      options: [
        { icon: <Image className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'PNG to JPG' },
        { icon: <Image className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'JPG to PNG' },
        { icon: <Image className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'WEBP to JPG' },
        { icon: <Image className="w-4 h-4 sm:w-5 sm:h-5" />, title: 'SVG to JPG' },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <h1 className="text-2xl sm:text-3xl text-center text-gray-800 mb-6 sm:mb-8 lg:mb-10 font-normal">
        File Converters
      </h1>

      <div className="space-y-2 sm:space-y-3">
        {converters.map((converter) => {
          const isOpen = openSections.includes(converter.id);

          return (
            <div
              key={converter.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
            >
              {/* Header */}
              <div
                className="text-white px-4 sm:px-5 py-2 sm:py-3 cursor-pointer transition-colors duration-300 flex items-center justify-between select-none"
                style={{ backgroundColor: '#dc3545' }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.backgroundColor = '#c02a37')
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.backgroundColor = '#dc3545')
                }
                onClick={() => toggleSection(converter.id)}
              >
                <div className="flex items-center">
                  <span className="mr-3 sm:mr-4">{converter.icon}</span>
                  <span className="text-base sm:text-lg font-medium text-center flex-1">{converter.title}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Expandable content */}
              <div
                className={`transition-all duration-400 ease-in-out overflow-hidden bg-gray-50 ${isOpen ? 'max-h-[500px] opacity-100 py-4 sm:py-5 px-4 sm:px-5' : 'max-h-0 opacity-0 py-0 px-4 sm:px-5'}`}
              >
                {converter.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {converter.options.map((option, index) => (
                      <div
                        key={index}
                        className="text-white px-4 py-2 sm:py-3 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center"
                        style={{ backgroundColor: '#dc3545' }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLElement).style.backgroundColor = '#c02a37')
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLElement).style.backgroundColor = '#dc3545')
                        }
                        onClick={() =>
                          navigate(`/converter/${encodeURIComponent(option.title.toLowerCase().replace(/\s+/g, "-"))}`, {
                            state: { fromFileConverter: true },
                          })
                        }
                      >
                        <span className="mr-2 sm:mr-3">{option.icon}</span>
                        <span className="text-sm sm:text-base font-medium text-center">{option.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileConverters;
