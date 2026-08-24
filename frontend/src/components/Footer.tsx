const Footer = () => {
    return (
        <footer className="bg-[#282828] text-gray-200 text-[14px] sm:text-[15px]">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-6 sm:gap-x-12 gap-y-8 sm:gap-y-10 w-full px-4 sm:px-6 lg:px-12 py-8 sm:py-12 mx-auto">
                {/* Left Column: Title + Paragraph */}
                <div className="sm:col-span-6">
                    <h2 className="text-white font-medium mb-3 sm:mb-4 text-base sm:text-lg">Converter</h2>
                    <p className="leading-6 sm:leading-7 text-sm sm:text-[17px] lg:text-[19px]">
                        Converter is an online service that allows you to convert files from one format to another.
                        We support a wide range of formats, including documents, images, audio, and video files.
                        Our service is free and easy to use, and we also provide tools to help you manage your files effectively.
                    </p>
                </div>

                {/* Right Column: Navigation + Tool Links */}
                <div className="sm:col-span-6 grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex flex-col space-y-1 sm:space-y-2">
                        <a href="/" className="hover:text-white p-2 -ml-2 text-sm sm:text-[15px]">Home</a>
                        <a href="/aboutpage" className="hover:text-white p-2 -ml-2 text-sm sm:text-[15px]">About</a>
                        <a href="/blogpage" className="hover:text-white p-2 -ml-2 text-sm sm:text-[15px]">Blogs</a>
                        <a href="/contactpage" className="hover:text-white p-2 -ml-2 text-sm sm:text-[15px]">Contact</a>
                    </div>
                    <div className="flex flex-col space-y-1 sm:space-y-2">
                        <a href="#" className="hover:text-white p-2 -ml-2 text-sm sm:text-[15px]">Video Converter</a>
                        <a href="#" className="hover:text-white p-2 -ml-2 text-sm sm:text-[15px]">Audio Converter</a>
                        <a href="#" className="hover:text-white p-2 -ml-2 text-sm sm:text-[15px]">Document Converter</a>
                        <a href="#" className="hover:text-white p-2 -ml-2 text-sm sm:text-[15px]">Image Converter</a>
                    </div>
                </div>
            </div>

            <div className="border-t border-[#444]" />

            {/* Bottom Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 text-center text-gray-300 text-[13px] sm:text-[14px]">
                <p className="p-2">©2025 JahaSoft. All rights reserved.</p>
                <div className="mt-2 sm:mt-4 space-x-2 sm:space-x-4 flex flex-wrap justify-center items-center">
                    <a href="#" className="hover:text-white p-2">Terms of Use</a>
                    <a href="/privacy" className="hover:text-white p-2">Privacy Policy</a>
                    <span className="block sm:inline p-2">| Contact: <a href="mailto:akshatshettigar2001@gmail.com" className="hover:text-white underline p-2">akshat.codagehabitation.com</a></span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
