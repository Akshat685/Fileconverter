import React, { useEffect, useRef } from "react";
import {
  FaFolderOpen,
  FaDropbox,
  FaGoogleDrive,
} from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

declare global {
  interface Window {
    Dropbox: any;
    gapi: any;
    google: any;
  }
}

export default function Dropbox() {
  const DROPBOX_APP_KEY = "2434iawyecdjpxc";
  const GOOGLE_CLIENT_ID = "866725812936-fvjl5btdg8d8s8mc03aihrvs3tmj3q6h.apps.googleusercontent.com";
  const GOOGLE_API_KEY = "AIzaSyDtxORXGl-d3mMhG4TKBGS90scPCX7JGyM";

  const fileInputRef = useRef<HTMLInputElement>(null);

  let pickerApiLoaded = false;
  let oauthToken = "";

 useEffect(() => {
  // This is called when gapi loads
  (window as any).onApiLoad = () => {
    window.gapi.load("client:auth2", async () => {
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      });

      // Load picker separately
      window.gapi.load("picker", {
        callback: () => {
          pickerApiLoaded = true;
        },
      });
    });
  };
}, []);


  const handleLocalFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("Selected local files:", files);
      alert(`Selected ${files.length} file(s) from local storage`);
    }
  };

  const handleDropboxUpload = () => {
    if (!window.Dropbox) {
      alert("Dropbox SDK not loaded.");
      return;
    }

    window.Dropbox.choose({
      linkType: "direct",
      multiselect: true,
      extensions: [".pdf", ".jpg", ".docx", ".png"],
      success: function (files: any[]) {
        console.log("Selected Dropbox files:", files);
        alert(`Selected ${files.length} file(s) from Dropbox`);
      },
      cancel: function () {
        console.log("Dropbox chooser closed.");
      },
    });
  };

  const handleGoogleDriveUpload = () => {
  const auth2 = window.gapi.auth2.getAuthInstance();
  auth2.signIn().then((googleUser: any) => {
    const token = googleUser.getAuthResponse().access_token;
    oauthToken = token;
    createGooglePicker();
  }).catch((err: any) => {
    console.error("Google Auth error:", err);
    alert("Google Auth failed.");
  });
};


  const createGooglePicker = () => {
    if (pickerApiLoaded && oauthToken) {
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(oauthToken)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            console.log("Selected Google Drive files:", data.docs);
            alert(`Selected ${data.docs.length} file(s) from Google Drive`);
          }
        })
        .build();
      picker.setVisible(true);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-2 converter-wrapper tall p-12 m-4 rounded-md">
          <div
            className="bg-red-500 text-white relative gap-4 rounded-md px-8 py-6 flex items-center space-x-6 shadow-md"
            style={{
              width: "50%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="font-semibold text-[15px]">Choose Files</span>

            {/* 👇 Local File Upload Trigger */}
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

            {/* 👇 Dropbox */}
            <FaDropbox
              onClick={handleDropboxUpload}
              title="Upload from Dropbox"
              className="text-white text-[26px] cursor-pointer hover:scale-110 transition"
            />

            {/* 👇 Google Drive */}
            <FaGoogleDrive
              onClick={handleGoogleDriveUpload}
              title="Upload from Google Drive"
              className="text-white text-[26px] cursor-pointer hover:scale-110 transition"
            />
          </div>

          <div className="dropboxfoot mt-5 text-sm text-gray-400">
            100 MB maximum file size and up to 5 files.
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 rounded-md">
        <h1 className="text-gray-500 text-center mt-4">
          Make sure you have uploaded valid files otherwise conversion will not be correct
        </h1>

        <button className="flex items-center gap-2 bg-red-400 text-white px-5 py-2 rounded-md text-[15px] font-semibold mt-2 hover:bg-red-500 transition">
          <FiArrowRight className="text-[16px]" />
          Convert files
        </button>
      </div>
    </div>
  );
}
