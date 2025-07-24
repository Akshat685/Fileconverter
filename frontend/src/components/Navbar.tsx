import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <nav className="sticky top-0 z-50 flex items-center justify-between sm:px-6 lg:px-8 py-3 bg-white shadow-md">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <img
            src="https://convertio.info/assets/img/logo.png"
            alt="Converter Logo"
            className="w-24 sm:w-28 h-6 sm:h-7 object-contain"
          />
          <button
            className="sm:hidden text-gray-600 hover:text-red-600 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={`${mobileMenuOpen ? "flex" : "hidden"
            } sm:flex flex-col sm:flex-row sm:items-left ml-10 gap-5 space-x-4 sm:space-x-5 lg:space-x-6 space-y-4 sm:space-y-0 absolute sm:static top-14 left-0 w-full sm:w-auto bg-white sm:bg-transparent px-4 sm:px-0 py-4 sm:py-0 border-b sm:border-none sm:shadow-none shadow-md`}
        >
          <a href="/" className="text-sm sm:text-[15px] hover:text-red-600">Home</a>
          <button
            ref={toggleButtonRef}
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center text-sm sm:text-[15px] hover:text-red-600 focus:outline-none"
          >
            Converter <ChevronDown size={14} className="ml-1" />
          </button>
          <a href="/aboutpage" className="text-sm sm:text-[15px] hover:text-red-600">About</a>
          <a href="/blogpage" className="text-sm sm:text-[15px] hover:text-red-600">Blogs</a>
          <a href="/contactpage" className="text-sm sm:text-[15px] hover:text-red-600">Contact</a>
        </div>

        <div className="hidden sm:block relative">
          <input
            ref={searchRef}
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search converter..."
            className="border border-[#ced4da] p-2 pl-4 pr-8 py-1 text-sm w-48 lg:w-64 focus:outline-none rounded-lg"
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
            <div className="absolute top-full w-full bg-white border border-[#ced4da] rounded-md shadow-md z-50 max-h-60 overflow-y-auto">
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
          className="fixed top-14 sm:top-[50px] left-0 w-full bg-white shadow-md border-t border-[#ced4da] z-[999] transition-all duration-300 ease-in-out"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Dropdownmenu closeDropdown={() => setDropdownOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;