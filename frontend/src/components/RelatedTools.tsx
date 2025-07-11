import { useParams, useNavigate } from "react-router-dom";

const tools: string[] = [
  // MP3 Converters
  "MP3 to AAC Converter", "MP3 to AIFF Converter", "MP3 to FLAC Converter", "MP3 to M4V Converter",
  "MP3 to MMF Converter", "MP3 to OGG Converter", "MP3 to OPUS Converter", "MP3 to WAV Converter",
  "MP3 to WMA Converter", "MP3 to 3G2 Converter", "MP3 to 3GP Converter", "MP3 to AVI Converter",
  "MP3 to FLV Converter", "MP3 to MKV Converter", "MP3 to MOV Converter", "MP3 to MP4 Converter",
  "MP3 to MPG Converter", "MP3 to OGV Converter", "MP3 to WEBM Converter", "MP3 to WMV Converter",

  // WAV Converters
  "WAV to AAC Converter", "WAV to AIFF Converter", "WAV to FLAC Converter", "WAV to M4V Converter",
  "WAV to MMF Converter", "WAV to MP3 Converter", "WAV to OGG Converter", "WAV to OPUS Converter",
  "WAV to WMA Converter", "WAV to 3G2 Converter", "WAV to 3GP Converter", "WAV to AVI Converter",
  "WAV to FLV Converter", "WAV to MKV Converter", "WAV to MOV Converter", "WAV to MP4 Converter",
  "WAV to MPG Converter", "WAV to OGV Converter", "WAV to WEBM Converter", "WAV to WMV Converter",

  // AAC Converters
  "AAC to FLAC Converter", "AAC to M4V Converter", "AAC to MMF Converter", "AAC to MP3 Converter",
  "AAC to OGG Converter", "AAC to OPUS Converter", "AAC to WAV Converter", "AAC to WMA Converter",
  "AAC to 3G2 Converter", "AAC to 3GP Converter", "AAC to AVI Converter", "AAC to FLV Converter",
  "AAC to MKV Converter", "AAC to MOV Converter", "AAC to MP4 Converter", "AAC to MPG Converter",
  "AAC to OGV Converter", "AAC to WEBM Converter", "AAC to WMV Converter", "AAC to AIFF Converter",

  // FLAC Converters
  "FLAC to AAC Converter", "FLAC to AIFF Converter", "FLAC to M4V Converter", "FLAC to MMF Converter",
  "FLAC to MP3 Converter", "FLAC to OGG Converter", "FLAC to OPUS Converter", "FLAC to WAV Converter",
  "FLAC to WMA Converter", "FLAC to 3G2 Converter", "FLAC to 3GP Converter", "FLAC to AVI Converter",
  "FLAC to FLV Converter", "FLAC to MKV Converter", "FLAC to MOV Converter", "FLAC to MP4 Converter",
  "FLAC to MPG Converter", "FLAC to OGV Converter", "FLAC to WEBM Converter", "FLAC to WMV Converter",

  // AVI Converters
  "AVI to MP4 Converter", "AVI to WMV Converter", "AVI to MOV Converter", "AVI to MKV Converter",
  "AVI to FLV Converter", "AVI to WEBM Converter",

  // MOV Converters
  "MOV to MP4 Converter", "MOV to AVI Converter", "MOV to WMV Converter", "MOV to MKV Converter",
  "MOV to FLV Converter", "MOV to WEBM Converter",

  // WEBM Converters
  "WEBM to MP4 Converter", "WEBM to AVI Converter", "WEBM to WMV Converter", "WEBM to MOV Converter",
  "WEBM to MKV Converter", "WEBM to FLV Converter",

  // Archive Converters
  "ZIP to TAR.GZ Converter", "TAR.GZ to ZIP Converter", "7Z to ZIP Converter", "TAR to ZIP Converter",

  // Ebook Converters
  "EPUB to PDF Converter", "MOBI to PDF Converter", "AZW3 to PDF Converter",

  // PDF Converters
  "PDF to DOCX Converter", "PDF to DOC Converter", "PDF to HTML Converter", "PDF to ODT Converter",
  "PDF to RTF Converter", "PDF to TXT Converter", "PDF to XLSX Converter", "PDF to XLS Converter",
  "PDF to ODS Converter", "PDF to PPTX Converter", "PDF to PPT Converter", "PDF to ODP Converter",
  "PDF to EPUB Converter",

  // PNG Converters
  "PNG to BMP Converter", "PNG to EPS Converter", "PNG to GIF Converter", "PNG to ICO Converter",
  "PNG to JPEG Converter", "PNG to SVG Converter", "PNG to TGA Converter", "PNG to TIFF Converter",
  "PNG to WBMP Converter", "PNG to WEBP Converter", "PNG to JPG Converter",

  // JPG Converters
  "JPG to BMP Converter", "JPG to EPS Converter", "JPG to GIF Converter", "JPG to ICO Converter",
  "JPG to JPEG Converter", "JPG to PNG Converter", "JPG to SVG Converter", "JPG to TGA Converter",
  "JPG to TIFF Converter", "JPG to WBMP Converter", "JPG to WEBP Converter",

  // WEBP Converters
  "WEBP to BMP Converter", "WEBP to EPS Converter", "WEBP to GIF Converter", "WEBP to ICO Converter",
  "WEBP to JPG Converter", "WEBP to JPEG Converter", "WEBP to PNG Converter", "WEBP to SVG Converter",
  "WEBP to TGA Converter", "WEBP to TIFF Converter", "WEBP to WBMP Converter",

  // SVG Converters
  "SVG to BMP Converter", "SVG to EPS Converter", "SVG to GIF Converter", "SVG to ICO Converter",
  "SVG to JPG Converter", "SVG to JPEG Converter", "SVG to PNG Converter", "SVG to TGA Converter",
  "SVG to TIFF Converter", "SVG to WBMP Converter", "SVG to WEBP Converter",
];

export default function RelatedTools() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Convert slug from "mp3-to-wav" to "MP3 to WAV"
  const formatSlug = (slug: string) => {
    return slug
      .split("-")
      .map((word) =>
        word.toLowerCase() === "to"
          ? "to"
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  const formattedSlug = slug ? formatSlug(slug) : "";
  const sourceFormat = formattedSlug.split(" to ")[0];

  const related = tools.filter((tool) =>
    tool.toLowerCase().startsWith(sourceFormat.toLowerCase() + " to")
  );

  const handleNavigation = (toolName: string) => {
    const toolSlug = toolName
      .replace(" Converter", "")
      .toLowerCase()
      .replace(/\s+/g, "-");
    navigate(`/converter/${toolSlug}`, {
      state: { fromFileConverter: true },
    });
  };    

  return (
<div className="max-w-3xl mt-10 mx-auto bg-white px-8 py-10 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.15)]">
      <h2 className="text-2xl font-semibold text-center mb-6">Related Tools</h2>
      {related.length === 0 ? (
        <p className="text-center text-gray-500">No related tools found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-5">
          {related.map((tool, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(tool)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded text-sm w-full text-left"
            >
              {tool}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
