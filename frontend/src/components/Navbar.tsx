import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Dropdownmenu from "./Dropdownmenu";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(target)
      ) {
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
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-3 bg-white shadow-md transition-shadow duration-200">
        <div className="flex items-center space-x-10 gap-5">
          <img
            src="https://convertio.info/assets/img/logo.png"
            alt="Converter Logo"
            className="w-13 h-6 object-contain"
          />
          <div className="flex ml-10 space-x-6 text-lg gap-5 text-[15px]">
            <a href="/" className="hover:text-red-600">
              Home
            </a>
            <button
              ref={toggleButtonRef}
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center hover:text-red-600 focus:outline-none"
            >
              Converter <ChevronDown size={14} className="ml-1" />
            </button>
            <a href="#">About</a>
            <a href="#">Blogs</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search converter..."
            className="border p-5 pl-4 pr-4 py-1 text-md mr-10 w-100 focus:outline-none focus:ring-2 rounded-lg"
          />
        </div>
      </nav>

      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className={`fixed top-[50px] left-0 w-full bg-white shadow-md border-t z-[999] transition-all duration-300 ease-in-out
  ${dropdownOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}
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
