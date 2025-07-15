import React, { useEffect, useRef, useState } from "react";
import { FaFolderOpen, FaDropbox, FaGoogleDrive } from "react-icons/fa";
import { FiArrowRight, FiDownload } from "react-icons/fi";

declare global {
  interface Window {
    Dropbox: any;
    gapi: any;
    google: any;
    onApiLoad?: () => void;
  }
}

interface FileItem {
  file: File;
  showMenu: boolean;

  section: keyof FormatOptions;
  selectedFormat: string;
  source?: string;
  url?: string;
  id: string;
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

interface ConvertedFile {
  name: string;
  url: string;
  loading: boolean;
  originalId: string;
}

export default function Dropbox() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY!;
  const API_URL = import.meta.env.VITE_API_URL || "https://fileconverter-backend.onrender.com";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerLoaded = useRef(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically load Google API script
    const loadGoogleApiScript = () => {
      if (!document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.async = true;
        script.onload = () => {
          console.log("Google API script loaded");
          initializeGoogleApi();
        };
        script.onerror = () => {
          console.error("Failed to load Google API script");
          setErrorMessage("Failed to load Google API script. Please check your network or browser settings.");
        };
        document.body.appendChild(script);
      } else {
        initializeGoogleApi();
      }
    };

    const initializeGoogleApi = () => {
      if (window.gapi) {
        window.onApiLoad = () => {
          window.gapi.load("client:auth2", async () => {
            try {
              await window.gapi.client.init({
                apiKey: GOOGLE_API_KEY,
                clientId: GOOGLE_CLIENT_ID,
                scope: "https://www.googleapis.com/auth/drive.readonly",
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
                // Add prompt to ensure user interaction
                prompt: "select_account",
              });
              console.log("Google API client initialized");

              window.gapi.load("picker", {
                callback: () => {
                  if (window.google?.picker) {
                    pickerLoaded.current = true;
                    console.log("Google Picker API loaded");
                  } else {
                    console.error("Google Picker API not available");
                    setErrorMessage("Google Picker API failed to load. Please try again.");
                  }
                },
              });
            } catch (err) {
              console.error("Google API initialization failed:", err);
              setErrorMessage("Failed to initialize Google API. Check your API key and client ID.");
            }
          });
        };

        // Trigger onApiLoad if gapi is already loaded
        if (window.gapi.load) {
          window.onApiLoad();
        }
      } else {
        console.error("Google API (gapi) not available");
        setErrorMessage("Google API not available. Please try again later.");
      }
    };

    loadGoogleApiScript();

    return () => {
      convertedFiles.forEach(file => window.URL.revokeObjectURL(file.url));
      delete window.onApiLoad;
    };
  }, [convertedFiles, GOOGLE_API_KEY, GOOGLE_CLIENT_ID]);

  const handleLocalFileClick = () => fileInputRef.current?.click();

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (selectedFiles.length + files.length > 5) {
        setErrorMessage("Maximum 5 files allowed.");
        return;
      }
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
          source: 'local',
          id: `${f.name}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        };
      });
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setConvertedFiles([]);
      setErrorMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDropboxUpload = () => {
    if (!window.Dropbox) {
      setErrorMessage("Dropbox SDK not loaded.");
      return;
    }
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
      success: async (files: any[]) => {
        if (selectedFiles.length + files.length > 5) {
          setErrorMessage("Maximum 5 files allowed.");
          return;
        }
        const newFiles = await Promise.all(files.map(async (f) => {
          try {
            const response = await fetch(f.link);
            if (!response.ok) throw new Error(`Failed to fetch Dropbox file: ${f.name}`);
            const blob = await response.blob();
            const ext = f.name.split('.').pop()?.toLowerCase() || '';
            const section = ext === 'pdf' ? 'pdfs' :
              ['bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg'].includes(ext) ? 'image' :
                ['docx', 'txt', 'rtf', 'odt'].includes(ext) ? 'document' :
                  ['mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma'].includes(ext) ? 'audio' :
                    ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv'].includes(ext) ? 'video' :
                      ['zip', '7z'].includes(ext) ? 'archive' :
                        ['epub', 'mobi', 'azw3'].includes(ext) ? 'ebook' : 'image';
            return {
              file: new File([blob], f.name, { type: blob.type }),
              showMenu: false,
              section: section as keyof FormatOptions,
              selectedFormat: "",
              source: 'dropbox',
              url: f.link,
              id: `${f.name}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
            };
          } catch (err) {
            console.error(`Error fetching Dropbox file ${f.name}:`, err);
            return null;
          }
        }));
        const validFiles = newFiles.filter(f => f !== null) as FileItem[];
        setSelectedFiles((prev) => [...prev, ...validFiles]);
        setConvertedFiles([]);
        setErrorMessage(null);
      },
      error: (err: any) => {
        console.error("Dropbox picker error:", err);
        setErrorMessage("Failed to load files from Dropbox.");
      },
    });
  };

  const handleGoogleDriveUpload = () => {
    if (!pickerLoaded.current) {
      console.warn("Google Picker not loaded yet. Attempting to initialize...");
      setErrorMessage("Google Picker is not ready. Please try again in a moment.");
      window.gapi?.load("picker", {
        callback: () => {
          if (window.google?.picker) {
            pickerLoaded.current = true;
            console.log("Google Picker API loaded on retry");
            triggerGoogleSignIn();
          } else {
            console.error("Google Picker API failed to load on retry");
            setErrorMessage("Google Picker failed to load. Please refresh the page.");
          }
        },
      });
      return;
    }
    triggerGoogleSignIn();
  };

  const triggerGoogleSignIn = async () => {
    if (!window.gapi?.auth2) {
      console.error("Google auth2 not available");
      setErrorMessage("Google authentication service not available. Please try again later.");
      return;
    }
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      // Force prompt to avoid silent failures
      const googleUser = await auth2.signIn({
        prompt: "select_account consent",
        scope: "https://www.googleapis.com/auth/drive.readonly",
      });
      const token = googleUser.getAuthResponse().access_token;
      console.log("Google Sign-in successful, access token:", token);
      createGooglePicker(token);
    } catch (err: any) {
      console.error("Google Sign-in failed:", err);
      if (err.error === "idpiframe_initialization_failed") {
        setErrorMessage("Google Sign-in failed: Third-party cookies are blocked. Please enable cookies in your browser settings or try a different browser.");
      } else if (err.error === "IdentityCredentialError") {
        setErrorMessage("Google Sign-in failed: Unable to retrieve token. Check your credentials or try again.");
      } else {
        setErrorMessage(`Google Sign-in failed: ${err.error || "Unknown error"}. Please check your credentials or try again.`);
      }
    }
  };

  const createGooglePicker = async (token: string) => {
    if (pickerLoaded.current && token && window.google?.picker) {
      console.log("Creating Google Picker with token:", token);
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(token)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback(async (data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            console.log("Files picked from Google Drive:", data.docs);
            if (selectedFiles.length + data.docs.length > 5) {
              setErrorMessage("Maximum 5 files allowed.");
              return;
            }
            const newFiles = await Promise.all(data.docs.map(async (doc: any) => {
              try {
                const response = await fetch(
                  `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                if (!response.ok) throw new Error(`Failed to fetch Google Drive file: ${doc.name}`);
                const blob = await response.blob();
                const ext = doc.name.split('.').pop()?.toLowerCase() || '';
                const section = ext === 'pdf' ? 'pdfs' :
                  ['bmp', 'eps', 'gif', 'ico', 'png', 'svg', 'tga', 'tiff', 'wbmp', 'webp', 'jpg', 'jpeg'].includes(ext) ? 'image' :
                    ['docx', 'txt', 'rtf', 'odt'].includes(ext) ? 'document' :
                      ['mp3', 'wav', 'aac', 'flac', 'ogg', 'opus', 'wma'].includes(ext) ? 'audio' :
                        ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv'].includes(ext) ? 'video' :
                          ['zip', '7z'].includes(ext) ? 'archive' :
                            ['epub', 'mobi', 'azw3'].includes(ext) ? 'ebook' : 'image';
                return {
                  file: new File([blob], doc.name, { type: blob.type }),
                  showMenu: false,
                  section: section as keyof FormatOptions,
                  selectedFormat: "",
                  source: 'google',
                  url: doc.url,
                  id: `${doc.name}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
                };
              } catch (err) {
                console.error(`Error fetching Google Drive file ${doc.name}:`, err);
                return null;
              }
            }));
            const validFiles = newFiles.filter(f => f !== null) as FileItem[];
            setSelectedFiles((prev) => [...prev, ...validFiles]);
            setConvertedFiles([]);
            setErrorMessage(null);
          }
        })
        .build();
      picker.setVisible(true);
    } else {
      console.error("Cannot create Google Picker. PickerLoaded:", pickerLoaded.current, "Token:", !!token, "Google Picker:", !!window.google?.picker);
      setErrorMessage("Failed to create Google Picker. Please try again.");
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
    setErrorMessage(null);
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

  const handleConvert = async () => {
    if (isConverting) return;
    if (selectedFiles.length === 0) {
      setErrorMessage("No files selected for conversion.");
      return;
    }

    if (selectedFiles.some((item) => !item.selectedFormat)) {
      setErrorMessage("Please select a format for all files.");
      return;
    }

    if (selectedFiles.length > 5) {
      setErrorMessage("Maximum 5 files allowed.");
      return;
    }

    console.log("Starting conversion for files:", selectedFiles.map(item => ({ name: item.file.name, id: item.id })));

    const formData = new FormData();
    const formats = selectedFiles.map((item) => ({
      name: item.file.name,
      target: item.selectedFormat.toLowerCase(),
      type: item.section,
      id: item.id,
    }));

    selectedFiles.forEach((item) => {
      formData.append("files", item.file);
    });
    formData.append("formats", JSON.stringify(formats));

    setIsConverting(true);
    setConvertedFiles([]);
    setErrorMessage(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(`${API_URL}/api/convert`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Conversion failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("Conversion response:", data);

      const converted = await Promise.all(
        data.files.map(async (file: { name: string; path: string }, index: number) => {
          try {
            console.log(`Fetching converted file: ${file.name} from ${API_URL}${file.path}`);
            const fileRes = await fetch(`${API_URL}${file.path}`);
            if (!fileRes.ok) {
              throw new Error(`Failed to fetch converted file: ${file.name}`);
            }
            const blob = await fileRes.blob();
            const url = window.URL.createObjectURL(blob);
            const originalId = formats[index].id;
            return { name: file.name, url, loading: false, originalId };
          } catch (err) {
            console.error(`Error fetching file ${file.name}:`, err);
            return null;
          }
        })
      );

      const validConverted = converted.filter(file => file !== null) as ConvertedFile[];
      console.log("Converted files set:", validConverted);
      setConvertedFiles(validConverted);
      if (converted.some(file => file === null)) {
        setErrorMessage("Some files failed to convert or download. Please try again.");
      } else if (validConverted.length === 0) {
        setErrorMessage("No files were converted successfully. Check file formats and try again.");
      } else {
        console.log("Conversion successful, files:", validConverted);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error during conversion";
      setErrorMessage(msg === "AbortError" ? "Conversion timed out. Please try again." : msg);
      console.error("Conversion error:", msg);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = async (url: string, name: string, index: number) => {
    setConvertedFiles(prev =>
      prev.map((file, i) => (i === index ? { ...file, loading: true } : file))
    );
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      console.log(`Downloaded file: ${name}`);
    } catch (err) {
      console.error(`Error downloading file ${name}:`, err);
      setErrorMessage(`Failed to download ${name}. Please try again.`);
    } finally {
      setConvertedFiles(prev =>
        prev.map((file, i) => (i === index ? { ...file, loading: false } : file))
      );
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
            {selectedFiles.map((item, index) => {
              const convertedFile = convertedFiles.find(file => file.originalId === item.id);
              console.log(`Checking match for ${item.file.name} (ID: ${item.id}):`, convertedFile ? convertedFile.name : 'No match');
              return (
                <div
                  key={item.id}
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
                    <div className="flex items-center gap-2">
                      {convertedFile && (
                        <button
                          onClick={() =>
                            handleDownload(
                              convertedFile.url,
                              convertedFile.name,
                              convertedFiles.findIndex(file => file.originalId === item.id)
                            )
                          }
                          disabled={convertedFile.loading}
                          className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-1 rounded-md text-[14px] font-semibold hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiDownload className="text-[16px]" />
                          {convertedFile.loading ? "Downloading..." : "Download"}
                        </button>
                      )}
                      <button
                        className="text-gray-400 hover:text-red-500 transition text-xl"
                        onClick={() => removeFile(index)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {item.showMenu && (
                    <div className="absolute top-full mt-2 right-12 bg-[#1f1f1f] text-white rounded-md p-4 w-[340px] shadow-xl text-sm font-medium z-50 flex">
                      <div className="flex flex-col border-r border-gray-700 pr-3 min-w-[100px]">
                        {Object.keys(formatOptions).map((section) => (
                          <button
                            key={section}
                            className={`text-left px-2 py-1 rounded hover:bg-[#333] ${item.section === section
                              ? "text-white font-bold"
                              : "text-gray-400"
                              }`}
                            onClick={() =>
                              setSection(index, section as keyof FormatOptions)
                            }
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
              );
            })}
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
          className={`flex items-center gap-2 bg-red-400 text-white px-5 py-2 rounded-md text-[15px] font-semibold mt-2 hover:bg-red-500 transition ${isConverting || selectedFiles.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <FiArrowRight className="text-[16px]" />
          {isConverting ? "Converting..." : "Convert files"}
        </button>
      </div>
    </div>
  );
}