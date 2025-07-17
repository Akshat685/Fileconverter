import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Dropdownmenu from "./Dropdownmenu";

const fileTypeMapping: Record<string, string[]> = {
  audio: ["mp3", "wav", "aac", "flac", "ogg", "opus", "wma", "aiff", "m4v", "mmf", "3g2"],
  video: ["mp4", "avi", "mov", "webm", "mkv", "flv", "wmv", "3gp", "mpg", "ogv"],
  image: ["png", "jpg", "jpeg", "webp", "svg", "bmp", "gif", "ico", "tga", "tiff", "wbmp"],
  pdfs: ["pdf"],
  document: ["doc", "docx", "txt", "rtf", "odt", "html", "ppt", "pptx", "xlsx"],
  archive: ["zip", "7z"],
  ebook: ["epub", "mobi", "azw3", "fb2", "lit", "lrf", "pdb", "tcr"],
};

const allTypes = Object.entries(fileTypeMapping).flatMap(([section, exts]) =>
  exts.map(ext => ({ ext, section }))
);

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState<{ ext: string; section: string }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(target) &&
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setDropdownOpen(false);
        setFiltered([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFiltered([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const matched = allTypes.filter(({ ext }) => ext.includes(term));
    setFiltered(matched);
  }, [searchTerm]);

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-3  bg-white shadow-md">
        <div className="flex items-center space-x-10 gap-5 ">
          <img
            src="https://convertio.info/assets/img/logo.png"
            alt="Converter Logo"
            className="w-30 h-7 object-contain"
          />
          <div className="flex ml-10 space-x-6 text-lg gap-5 text-[15px]">
            <a href="/" className="hover:text-red-600">Home</a>
            <button
              ref={toggleButtonRef}
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center hover:text-red-600 focus:outline-none"
            >
              Converter <ChevronDown size={14} className="ml-1" />
            </button>
            <a href="/aboutpage" className="hover:text-red-600">About</a>
            <a href="/blogpage" className="hover:text-red-600">Blogs</a>
            <a href="/contactpage" className="hover:text-red-600">Contact</a>
          </div>
        </div>

        <div className="relative">
          <input
            ref={searchRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search converter..."
            className="border-1 border-[#ced4da] p-2 pl-4 pr-8 py-1 text-md w-64 focus:outline-none  rounded-lg"
          />

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFiltered([]);
                searchRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              ×
            </button>
          )}

          {filtered.length > 0 && (
            <div className="absolute border-[#ced4da] top-full mt-1 w-full bg-white border rounded-md shadow-md z-50">
              {filtered.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    window.location.href = `/converter/${item.section}`;
                    setSearchTerm("");
                    setFiltered([]);
                  }}
                >
                  {item.ext.toUpperCase()} to {item.section.toUpperCase()} converter
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="fixed top-[50px] left-0 w-full border-[#ced4da] bg-white shadow-md border-t z-[999] transition-all duration-300 ease-in-out"
        >
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Dropdownmenu closeDropdown={() => setDropdownOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
