import { FaCog, FaStar } from "react-icons/fa";

const Features = () => {
  return (
    <section className="bg-white py-16">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 gap-12 text-center">
        {/* Feature 1 */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full border border-black">
            <FaCog className="text-red-500 text-xl" />
          </div>
          <h3 className="text-lg font-semibold mb-4">300+ formats supported</h3>
          <p className="text-gray-800 leading-7 max-w-xs">
            We support more than 25600 different conversions between more than 300
            different file formats. More than any other converter.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full border border-black">
            <FaStar className="text-red-500 text-xl" />
          </div>
          <h3 className="text-lg font-semibold mb-4">Fast and easy</h3>
          <p className="text-gray-800 leading-7 max-w-xs">
            Just drop your files on the page, choose an output format and click "Convert" button.
            Wait a little for the process to complete.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
