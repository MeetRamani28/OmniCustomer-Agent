import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { uploadFile } from "../services/api"; // Standard Vite TS resolution
import toast from "react-hot-toast";

export const AdminDashboard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (ext !== "txt" && ext !== "md" && ext !== "pdf") {
        toast.error("Only .txt, .md, and .pdf files are supported for ingestion.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      toast.success(`Knowledge base updated: ${response.filename}`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error("Failed to sync document to the Vector DB.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UploadCloud className="text-blue-600" />
            Admin Control Center
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Dynamically ingest knowledge into the Vector RAG Cluster.
          </p>
        </div>

        <div className="p-6 md:p-8">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 transition-colors hover:bg-slate-100/50">
            <FileText size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              Select Knowledge Document
            </h3>
            <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
              Upload standard operating procedures, policies, or product manuals
              (.txt, .md, .pdf).
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".txt,.md,.pdf"
              className="hidden"
              id="file-upload"
            />

            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              Browse Local Files
            </label>

            {file && (
              <div className="mt-6 flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm w-full max-w-md">
                <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                <span className="text-sm font-medium text-slate-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-slate-400 ml-auto shrink-0">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <AlertCircle size={16} className="text-amber-500" />
              Documents are instantly chunked and vectorized.
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              {isUploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <UploadCloud size={18} />
              )}
              {isUploading ? "Ingesting to Pinecone..." : "Deploy to Swarm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
