import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import Dropdownmenu from "./Dropdownmenu";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav
        ref={dropdownRef}
        className={`sticky top-0 z-50 flex items-center justify-between px-8 py-3 bg-white transition-shadow duration-200 ${dropdownOpen ? '' : 'shadow-md'
          }`}
      >
        {/* Left side: Logo + Nav links */}
        <div className="flex items-center space-x-10 gap-5">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img
              src="https://convertio.info/assets/img/logo.png"
              alt="Converter Logo"
              className="w-13 h-6 object-contain"
            />
          </div>

          {/* Nav Links */}
          <div className="flex ml-10 space-x-6 text-lg gap-5  text-[15px] ">
            <a href="#" >Home</a>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center hover:text-red-600 focus:outline-none"
              aria-expanded={dropdownOpen}
              aria-controls="converter-dropdown"
              aria-label="Toggle converter options"
            >
              Converter <ChevronDown size={14} className="ml-1" />
            </button>
            <a href="#" >About</a>
            <a href="#" >Blogs</a>
            <a href="#" >Contact</a>
          </div>
        </div>

        {/* Right side: Search */}
        <div>
          <input
            type="text"
            placeholder="Search converter..."
            className="border p-5 pl-4 pr-4 py-1 text-md mr-10 w-100 focus:outline-none focus:ring-2 rounded-lg "
          />
        </div>
      </nav>

      {/* DROPDOWN MENU - FULL WIDTH BELOW NAV */}
      {dropdownOpen && (
        <div
          id="converter-dropdown"
          className="fixed top-[50px] w-full px-8 py-8 border-b bg-white z-40 shadow-md"
        >
          <div className="max-w-6xl ml-4">
            <Dropdownmenu />
          </div>
        </div>
      )}

    </>
  );
};

export default Navbar;