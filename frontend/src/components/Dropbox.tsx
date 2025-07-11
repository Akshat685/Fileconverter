import React, { useEffect, useRef, useState } from "react";
import { FaFolderOpen, FaDropbox, FaGoogleDrive } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

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
  section: string;
  selectedFormat: string;
}

export default function Dropbox() {
  // const DROPBOX_APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY!;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY!;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerLoaded = useRef(false);

  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    window.onApiLoad = () => {
      window.gapi.load("client:auth2", async () => {
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/drive.readonly",
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
        });

        window.gapi.load("picker", {
          callback: () => {
            if (google?.picker) {
              window.google = window.google || {};
              window.google.picker = google.picker;
              pickerLoaded.current = true;
            }
          },
        });
      });
    };
  }, []);

  const handleLocalFileClick = () => fileInputRef.current?.click();

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((f) => ({
        file: f,
        showMenu: false,
        section: "image",
        selectedFormat: "",
      }));
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDropboxUpload = () => {
    if (!window.Dropbox) return alert("Dropbox SDK not loaded.");
    window.Dropbox.choose({
      linkType: "direct",
      multiselect: true,
      extensions: [".pdf", ".jpg", ".docx", ".png"],
      success: (files: any[]) => {
        const mockFiles = files.map((f) => ({
          file: new File([""], f.name),
          showMenu: false,
          section: "image",
          selectedFormat: "",
        }));
        setSelectedFiles((prev) => [...prev, ...mockFiles]);
      },
    });
  };
  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      // alert("No files selected for conversion.");
      return;
    }

    const formData = new FormData();

    selectedFiles.forEach((item, i) => {
      formData.append("files", item.file);
      formData.append("formats[]", JSON.stringify({
        name: item.file.name,
        target: item.selectedFormat,
        type: item.section,
      }));
    });

    try {
      const res = await fetch("http://localhost:5000/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Conversion failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted_files.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Conversion failed. Try again.");
      console.error(err);
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
    if (pickerLoaded && token && window.google?.picker) {
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(token)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const mockFiles = data.docs.map((doc: any) => ({
              file: new File([""], doc.name),
              showMenu: false,
              section: "image",
              selectedFormat: "",
            }));
            setSelectedFiles((prev) => [...prev, ...mockFiles]);
          }
        })
        .build();
      picker.setVisible(true);
    }
  };

  const formatOptions = {
    image: ["BMP", "EPS", "GIF", "ICO", "PNG", "SVG", "TGA", "TIFF", "WBMP", "WEBP"],
    compressor: ["JPG IMAGE COMPRESS", "PNG IMAGE COMPRESS", "SVG IMAGE COMPRESS"],
    pdfs: ["Image to PDF",],
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

  const setSection = (index: number, section: string) => {
    const updated = [...selectedFiles];
    updated[index].section = section;
    setSelectedFiles(updated);
  };

  const selectFormat = (index: number, format: string) => {
    const updated = [...selectedFiles];
    updated[index].selectedFormat = format;
    updated[index].showMenu = false;
    setSelectedFiles(updated);
  };

  return (
    <div>
      {/* Upload UI */}
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

          {/* File List */}
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

                {/* Format Menu */}
                {item.showMenu && (
                  <div className="absolute top-full mt-2 right-12 bg-[#1f1f1f] text-white rounded-md p-4 w-[340px] shadow-xl text-sm font-medium z-50 flex">
                    {/* Left: Tabs */}
                    <div className="flex flex-col border-r border-gray-700 pr-3 min-w-[100px]">
                      {Object.keys(formatOptions).map((section) => (
                        <button
                          key={section}
                          className={`text-left px-2 py-1 rounded hover:bg-[#333] ${item.section === section
                            ? "text-white font-bold"
                            : "text-gray-400"
                            }`}
                          onClick={() => setSection(index, section)}
                        >
                          {section.charAt(0).toUpperCase() + section.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Right: Formats */}
                    <div className="flex-1 pl-4">
                      <div className="grid grid-cols-2 gap-2">
                        {(formatOptions[item.section] || []).map((format) => (
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

      {/* Footer */}
      <div className="flex flex-col items-center justify-center space-y-2 rounded-md">
        <h1 className="text-gray-500 text-center mt-4">
          Make sure you have uploaded valid files otherwise conversion will not
          be correct
        </h1>

        <button
          onClick={handleConvert}
          className="flex items-center gap-2 bg-red-400 text-white px-5 py-2 rounded-md text-[15px] font-semibold mt-2 hover:bg-red-500 transition"
        >
          <FiArrowRight className="text-[16px]" />
          Convert files
        </button>
      </div>
    </div>
  );
}
