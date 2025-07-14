import React, { useEffect, useRef, useState } from "react";
import { FaFolderOpen, FaDropbox, FaGoogleDrive } from "react-icons/fa";
import { FiArrowRight, FiDownload } from "react-icons/fi";

declare global {
  interface Window {
    Dropbox: any;
    gapi: any;
    google: any;
    onApiLoad: () => void;
  }
}

interface FileItem {
  file: File;
  showMenu: boolean;
  section: keyof FormatOptions;
  selectedFormat: string;
}

interface FormatOptions {
  image: string[];
  compressor: string[];
  pdfs: string[];
  audio: string[];
  video: string[];
  document: string[];
  archive: string[];
  ebook: string[];
}

export default function Dropbox() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY!;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerLoaded = useRef(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>("converted_files.zip");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    window.onApiLoad = () => {
      window.gapi.load("client:auth2", async () => {
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/drive.readonly",
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        });

        window.gapi.load("picker", {
          callback: () => {
            if (window.google?.picker) {
              pickerLoaded.current = true;
            }
          },
        });
      });
    };

    return () => {
      if (downloadUrl) {
        window.URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleLocalFileClick = () => fileInputRef.current?.click();

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase() || '';
        const section = ext === 'pdf' ? 'pdfs' : 
                       ['bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg'].includes(ext) ? 'image' :
                       ['docx', 'txt', 'rtf', 'odt'].includes(ext) ? 'document' :
                       ['mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma'].includes(ext) ? 'audio' :
                       ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv'].includes(ext) ? 'video' :
                       ['zip', '7z'].includes(ext) ? 'archive' :
                       ['epub', 'mobi', 'azw3'].includes(ext) ? 'ebook' : 'image';
        return {
          file: f,
          showMenu: false,
          section: section as keyof FormatOptions,
          selectedFormat: "",
        };
      });
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setDownloadUrl(null);
      setErrorMessage(null);
    }
  };

  const handleDropboxUpload = () => {
    if (!window.Dropbox) return alert("Dropbox SDK not loaded.");
    window.Dropbox.choose({
      linkType: "direct",
      multiselect: true,
      extensions: [
        ".mp3", ".wav", ".aac", ".flac", ".ogg", ".opus", ".wma",
        ".mp4", ".avi", ".mov", ".webm", ".mkv", ".flv", ".wmv",
        ".png", ".jpg", ".jpeg", ".webp", ".svg", ".bmp", ".gif", ".ico", ".tga", ".tiff", ".wbmp",
        ".pdf", ".docx", ".txt", ".rtf", ".odt",
        ".zip", ".7z",
        ".epub", ".mobi", ".azw3",
      ],
      success: (files: any[]) => {
        const mockFiles = files.map((f) => {
          const ext = f.name.split('.').pop()?.toLowerCase() || '';
          const section = ext === 'pdf' ? 'pdfs' : 
                         ['bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg'].includes(ext) ? 'image' :
                         ['docx', 'txt', 'rtf', 'odt'].includes(ext) ? 'document' :
                         ['mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma'].includes(ext) ? 'audio' :
                         ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv'].includes(ext) ? 'video' :
                         ['zip', '7z'].includes(ext) ? 'archive' :
                         ['epub', 'mobi', 'azw3'].includes(ext) ? 'ebook' : 'image';
          return {
            file: new File([""], f.name),
            showMenu: false,
            section: section as keyof FormatOptions,
            selectedFormat: "",
          };
        });
        setSelectedFiles((prev) => [...prev, ...mockFiles]);
        setDownloadUrl(null);
        setErrorMessage(null);
      },
    });
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage("No files selected for conversion.");
      return;
    }
    if (selectedFiles.some((item) => !item.selectedFormat)) {
      setErrorMessage("Please select a format for all files.");
      return;
    }

    // Validate section and format compatibility
    for (const item of selectedFiles) {
      const ext = item.file.name.split('.').pop()?.toLowerCase() || '';
      const validSection = ext === 'pdf' ? 'pdfs' : 
                          ['bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg'].includes(ext) ? 'image' :
                          ['docx', 'txt', 'rtf', 'odt'].includes(ext) ? 'document' :
                          ['mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma'].includes(ext) ? 'audio' :
                          ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv'].includes(ext) ? 'video' :
                          ['zip', '7z'].includes(ext) ? 'archive' :
                          ['epub', 'mobi', 'azw3'].includes(ext) ? 'ebook' : 'image';
      if (item.section !== validSection) {
        setErrorMessage(`Invalid section for ${item.file.name}. Please select "${validSection}" section.`);
        return;
      }
    }

    setIsConverting(true);
    setDownloadUrl(null);
    setErrorMessage(null);

    const formData = new FormData();
    
    const formats = selectedFiles.map((item) => ({
      name: item.file.name,
      target: item.selectedFormat,
      type: item.section,
    }));

    selectedFiles.forEach((item) => {
      formData.append("files", item.file);
    });

    formData.append("formats", JSON.stringify(formats));

    try {
      console.log('Sending conversion request to:', `${API_URL}/api/convert`);
      const res = await fetch(`${API_URL}/api/convert`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Conversion failed. Please try again.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadFileName("converted_files.zip");
    } catch (err) {
      console.error('Conversion request failed:', err);
      const message = err instanceof Error ? err.message : `Failed to connect to the server. Please ensure the backend is running at ${API_URL}`;
      setErrorMessage(message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleGoogleDriveUpload = () => {
    if (!pickerLoaded.current) return alert("Google Picker not loaded.");
    const auth2 = window.gapi.auth2.getAuthInstance();
    auth2
      .signIn()
      .then((googleUser: any) => {
        const token = googleUser.getAuthResponse().access_token;
        createGooglePicker(token);
      })
      .catch(() => alert("Google Sign-in failed."));
  };

  const createGooglePicker = (token: string) => {
    if (pickerLoaded.current && token && window.google?.picker) {
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(token)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const mockFiles = data.docs.map((doc: any) => {
              const ext = doc.name.split('.').pop()?.toLowerCase() || '';
              const section = ext === 'pdf' ? 'pdfs' : 
                             ['bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg'].includes(ext) ? 'image' :
                             ['docx', 'txt', 'rtf', 'odt'].includes(ext) ? 'document' :
                             ['mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma'].includes(ext) ? 'audio' :
                             ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv'].includes(ext) ? 'video' :
                             ['zip', '7z'].includes(ext) ? 'archive' :
                             ['epub', 'mobi', 'azw3'].includes(ext) ? 'ebook' : 'image';
              return {
                file: new File([""], doc.name),
                showMenu: false,
                section: section as keyof FormatOptions,
                selectedFormat: "",
              };
            });
            setSelectedFiles((prev) => [...prev, ...mockFiles]);
            setDownloadUrl(null);
            setErrorMessage(null);
          }
        })
        .build();
      picker.setVisible(true);
    }
  };

  const formatOptions: FormatOptions = {
    image: ["BMP", "EPS", "GIF", "ICO", "PNG", "SVG", "TGA", "TIFF", "WBMP", "WEBP", "JPG", "JPEG", "PDF", "DOCX"],
    compressor: ["JPG", "PNG", "SVG"],
    pdfs: ["DOCX", "JPG", "PNG", "GIF"],
    audio: ["MP3", "WAV", "AAC", "FLAC", "OGG", "OPUS", "WMA"],
    video: ["MP4", "AVI", "MOV", "WEBM", "MKV", "FLV", "WMV"],
    document: ["DOCX", "PDF", "TXT", "RTF", "ODT"],
    archive: ["ZIP", "7Z"],
    ebook: ["EPUB", "MOBI", "PDF", "AZW3"],
  };

  const toggleMenu = (index: number) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, showMenu: !item.showMenu } : { ...item, showMenu: false }
      )
    );
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const setSection = (index: number, section: keyof FormatOptions) => {
    const updated = [...selectedFiles];
    updated[index].section = section;
    updated[index].selectedFormat = "";
    setSelectedFiles(updated);
  };

  const selectFormat = (index: number, format: string) => {
    const updated = [...selectedFiles];
    updated[index].selectedFormat = format;
    updated[index].showMenu = false;
    setSelectedFiles(updated);
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = downloadFileName;
      a.click();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-2 converter-wrapper tall p-12 m-4 rounded-md">
          <div className="bg-red-500 text-white relative gap-4 rounded-md px-8 py-6 flex items-center space-x-6 shadow-md w-[50%] justify-center">
            <span className="font-semibold text-[15px]">Choose Files</span>
            <FaFolderOpen
              onClick={handleLocalFileClick}
              title="Upload from device"
              className="text-white text-[26px] cursor-pointer hover:scale-110 transition"
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleLocalFileChange}
              style={{ display: "none" }}
              accept=".mp3,.wav,.aac,.flac,.ogg,.opus,.wma,.mp4,.avi,.mov,.webm,.mkv,.flv,.wmv,.png,.jpg,.jpeg,.webp,.svg,.bmp,.gif,.ico,.tga,.tiff,.wbmp,.pdf,.docx,.txt,.rtf,.odt,.zip,.7z,.epub,.mobi,.azw3"
            />
            <FaDropbox
              onClick={handleDropboxUpload}
              title="Upload from Dropbox"
              className="text-white text-[26px] cursor-pointer hover:scale-110 transition"
            />
            <FaGoogleDrive
              onClick={handleGoogleDriveUpload}
              title="Upload from Google Drive"
              className="text-white text-[26px] cursor-pointer hover:scale-110 transition"
            />
          </div>
          <div className="dropboxfoot mt-5 text-sm text-gray-400">
            100 MB maximum file size and up to 5 files.
          </div>
          {errorMessage && (
            <div className="mt-4 text-red-500 text-sm font-medium">
              {errorMessage}
            </div>
          )}
          <div className="mt-6 w-full max-w-2xl space-y-3">
            {selectedFiles.map((item, index) => (
              <div
                key={index}
                className="relative bg-white text-gray-700 rounded-md px-4 py-3 shadow-md border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xl">📄</span>
                    <p className="truncate max-w-[160px] text-sm font-medium">
                      {item.file.name}
                    </p>
                    <span className="text-sm text-gray-400">to</span>
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-sm rounded-md px-2 py-1"
                      onClick={() => toggleMenu(index)}
                    >
                      {item.selectedFormat || "Select format"}
                    </button>
                  </div>
                  <button
                    className="text-gray-400 hover:text-red-500 transition text-xl"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
                {item.showMenu && (
                  <div className="absolute top-full mt-2 right-12 bg-[#1f1f1f] text-white rounded-md p-4 w-[340px] shadow-xl text-sm font-medium z-50 flex">
                    <div className="flex flex-col border-r border-gray-700 pr-3 min-w-[100px]">
                      {Object.keys(formatOptions).map((section) => (
                        <button
                          key={section}
                          className={`text-left px-2 py-1 rounded hover:bg-[#333] ${
                            item.section === section ? "text-white font-bold" : "text-gray-400"
                          }`}
                          onClick={() => setSection(index, section as keyof FormatOptions)}
                        >
                          {section.charAt(0).toUpperCase() + section.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 pl-4">
                      <div className="grid grid-cols-2 gap-2">
                        {formatOptions[item.section].map((format) => (
                          <button
                            key={format}
                            className="bg-[#333] hover:bg-red-600 transition px-3 py-2 rounded text-white text-xs"
                            onClick={() => selectFormat(index, format)}
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center space-y-2 rounded-md">
        <h1 className="text-gray-500 text-center mt-4">
          Make sure you have uploaded valid files otherwise conversion will not be correct
        </h1>
        <button
          onClick={handleConvert}
          disabled={isConverting || selectedFiles.length === 0}
          className={`flex items-center gap-2 bg-red-400 text-white px-5 py-2 rounded-md text-[15px] font-semibold mt-2 hover:bg-red-500 transition ${
            isConverting || selectedFiles.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiArrowRight className="text-[16px]" />
          {isConverting ? "Converting..." : "Convert files"}
        </button>
        {downloadUrl && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-md text-[15px] font-semibold mt-2 hover:bg-green-600 transition"
          >
            <FiDownload className="text-[16px]" />
            Download Converted Files
          </button>
        )}
      </div>
    </div>
  );
}