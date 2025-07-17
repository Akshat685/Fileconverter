// blogData.ts
import convertImage from "../images/convert.png";

export const blogs = [
  {
    title: "Best Audio Conversion Tools",
    type: "audio",
    link: "",
    image: convertImage,
    description: "Convert between MP3, AAC, OGG and more easily...",
  },
  {
    title: "Video Format Guide",
    type: "video",
    link: "",
    image: convertImage,
    description: "Everything you need to know about converting video formats...",
  },
  {
    title: "Image Compression Tips",
    type: "compressor",
    link: "",
    image: convertImage,
    description: "Reduce image sizes with minimal quality loss...",
  },
  {
    title: "PDF to Word Conversion",
    type: "document",
    link: "",
    image: convertImage,
    description: "Turn your PDFs into editable Word documents easily...",
  },
  {
    title: "eBook Formats Explained",
    type: "ebook",
    link: "",
    image: convertImage,
    description: "Learn about EPUB, MOBI, and how to convert between them...",
  },
  {
    title: "Archive Converter Guide",
    type: "archive",
    link: "",
    image: convertImage,
    description: "Unzip, convert and recompress RAR, ZIP, 7z files...",
  },
  {
    title: "Webservice-Based File Conversion",
    type: "webservice",
    link: "",
    image: convertImage,
    description: "Serverless tools that help convert files online...",
  },
  {
    title: "Image Conversion Explained",
    type: "image",
    link: "",
    image: convertImage,
    description: "JPG to PNG to SVG — learn the difference...",
  },
  {
    title: "Device Specific Conversions",
    type: "device",
    link: "",
    image: convertImage,
    description: "How to convert files for phones, tablets, etc.",
  },
];


const Blogs = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 ">
      <h1 className="text-3xl text-red-600 font-bold text-center mb-2">Blogs</h1>
      <p className="text-center text-gray-600 mb-8">Latest news and updates</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ">
        {blogs.map((blog, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow border overflow-hidden hover:shadow-lg transition border-[#ced4da]"
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
