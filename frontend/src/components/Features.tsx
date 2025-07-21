import { FaCog, FaStar } from "react-icons/fa";

const Features = () => {
  return (
    <section className="bg-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 text-center">
        {/* Feature 1 */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-6 flex items-center justify-center rounded-full border border-black">
            <FaCog className="text-red-500 text-lg sm:text-xl" />
          </div>
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">300+ formats supported</h3>
          <p className="text-gray-800 text-sm sm:text-base leading-6 sm:leading-7 max-w-xs mx-auto">
            We support more than 25600 different conversions between more than 300
            different file formats. More than any other converter.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-6 flex items-center justify-center rounded-full border border-black">
            <FaStar className="text-red-500 text-lg sm:text-xl" />
          </div>
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">Fast and easy</h3>
          <p className="text-gray-800 text-sm sm:text-base leading-6 sm:leading-7 max-w-xs mx-auto">
            Just drop your files on the page, choose an output format and click "Convert" button.
            Wait a little for the process to complete.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;