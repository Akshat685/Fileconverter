import convertImage from "../images/convert.png";

const blogs = [
  {
    title: "Online Convert The Ultimate Free Online File Converter",
    link: "#",
    image: convertImage,
    description:
      "In today's digital age, file formats come in all shapes and sizes. Whether you're working...",
  },
  {
    title: "Convert your files to any format with Convertio",
    link: "#",
    image: convertImage,
    description:
      "In today’s fast-moving digital world, converting files from one format to another is a...",
  },
  {
    title: "File Converter | Convert & compress everything",
    link: "#",
    image: convertImage,
    description:
      "In today’s fast-moving digital world, file formats often become a hurdle in work,...",
  },
  {
    title: "All in one File Converter: Convert Images...",
    link: "#",
    image: convertImage,
    description:
      "We often deal with many types of files—images, audio files, videos, PDFs, documents,...",
  },
];

const Blogs = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl text-red-600 font-bold text-center mb-2">Blogs</h1>
      <p className="text-center text-gray-600 mb-8">Latest news and updates</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {blogs.map((blog, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow border overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <a
                href={blog.link}
                className="text-blue-700 font-semibold hover:underline block text-md mb-2 line-clamp-2"
              >
                {blog.title}
              </a>
              <p className="text-gray-600 text-sm line-clamp-2">{blog.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
