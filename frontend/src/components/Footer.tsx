
const Footer = () => {
    return (
        <footer className="bg-[#282828] text-[#c9c9c9] text-[15px]">
            {/* Grid Layout: 2 Main Columns (6 + 6) */}
            <div className="grid grid-cols-12 gap-x-12 gap-y-10 w-full p-12  ml-0 mx-auto">
                {/* Left Column: Title + Paragraph */}
                <div className="col-span-6 md:col-span-6">
                    <h6 className="text-[#b0b0b0] font-medium mb-4">Conterter</h6>
                    <p className="leading-7 text-[19px]">
                        Converter is an online service that allows you to convert files from one format to another. 
                        We support a wide range of formats, including documents, images, audio and video files.
                         Our service is free and easy to use, and we also provide a range of tools and features to help you manage your files more effectively
                    </p>
                </div>

                {/* Right Column: Navigation + Tool Links combined */}
                <div className="col-span-6 md:col-span-6 grid grid-cols-2 gap-6">
                    {/* Navigation Links */}
                    <div className="flex flex-col space-y-3">
                        <a href="#" className="hover:text-white">Home</a>
                        <a href="#" className="hover:text-white">About</a>
                        <a href="#" className="hover:text-white">Blogs</a>
                        <a href="#" className="hover:text-white">Contact</a>
                    </div>

                    {/* Tool Links */}
                    <div className="flex flex-col space-y-3">
                        <a href="#" className="hover:text-white">Video Converter</a>
                        <a href="#" className="hover:text-white">Audio Converter</a>
                        <a href="#" className="hover:text-white">Document Converter</a>
                        <a href="#" className="hover:text-white">Image Converter</a>
                    </div>
                </div>
            </div>

            {/* Divider Line */}
            <div className="border-t border-[#333]" />

            {/* Bottom Section */}
            <div className="max-w-7xl mx-auto px-12 py-8 text-center text-[#999] text-[14px]">
                <p>©2025 JahaSoft. All rights reserved.</p>
                <div className="mt-2 space-x-6 mt-6">
                    <a href="#" className="hover:text-white">Terms of Use</a>
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
