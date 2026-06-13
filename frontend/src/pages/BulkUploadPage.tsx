import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { useToast } from '../contexts/ToastContext';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImportErrorItem {
  row: number;
  url?: string;
  error: string;
}

interface ImportResult {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  imported: any[];
  errors: ImportErrorItem[];
}

export const BulkUploadPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Mutation for CSV upload
  const uploadMutation = useMutation({
    mutationFn: async (csvText: string) => {
      // Send raw text with content-type text/csv
      const res = await api.post('/urls/import', csvText, {
        headers: {
          'Content-Type': 'text/csv',
        },
      });
      return res.data.data as ImportResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      setImportResult(data);
      
      if (data.errorCount === 0) {
        toast('Import Complete!', `Successfully shortened all ${data.successCount} links.`, 'success');
      } else {
        toast(
          'Import Complete with Warnings',
          `Shortened ${data.successCount} links. ${data.errorCount} rows had errors.`,
          'info'
        );
      }
    },
    onError: (err: any) => {
      toast('Upload Failed', err.response?.data?.message || 'Failed to process CSV file.', 'error');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast('Invalid File Type', 'Please upload a valid .csv file.', 'error');
      return;
    }

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleTriggerUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent) return;
    uploadMutation.mutate(csvContent);
  };

  const downloadSampleCsv = () => {
    const headers = 'originalUrl,customAlias,expiryDate\n';
    const row1 = 'https://github.com/google/gemini,gemini-code,2026-12-31T23:59:59Z\n';
    const row2 = 'https://news.ycombinator.com,hn-news,\n';
    
    const blob = new Blob([headers + row1 + row2], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'nanolink_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Template Downloaded', 'Open this in Excel/Notepad to structure your imports.', 'info');
  };

  const handleReset = () => {
    setCsvContent('');
    setFileName('');
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Bulk CSV Import</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Create hundreds of shortened URLs in a single action by uploading a CSV spreadsheet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CSV Upload Form (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!importResult ? (
              <motion.div
                key="upload-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm"
              >
                <form onSubmit={handleTriggerUpload} className="space-y-6">
                  {/* File drop area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-indigo-550 bg-indigo-50/10 dark:bg-indigo-950/10'
                        : 'border-slate-250 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    
                    <UploadCloud className="h-10 w-10 text-indigo-500/80 mb-4 bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-full box-content" />
                    
                    {fileName ? (
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                          <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                          {fileName}
                        </p>
                        <p className="text-xs text-slate-450 mt-1">Click or drag another file to replace</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold">Click to upload or drag & drop</p>
                        <p className="text-xs text-slate-455 dark:text-slate-450 mt-1">CSV spreadsheet up to 5MB</p>
                      </div>
                    )}
                  </div>

                  {/* Submission buttons */}
                  {fileName && (
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl border border-slate-205 dark:border-slate-800 px-5 py-3 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        disabled={uploadMutation.isPending}
                        className="rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white px-6 py-3 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/10"
                      >
                        {uploadMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing spreadsheet...
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            Process CSV Import
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            ) : (
              // Results Display Pane
              <motion.div
                key="results-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6"
              >
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
                  <h3 className="font-extrabold text-base">Import Results Summary</h3>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Import New File
                  </button>
                </div>

                {/* Import aggregate stats counters */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 border border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                    <p className="text-xs text-slate-500 font-semibold uppercase">Total Rows</p>
                    <h4 className="text-xl font-black mt-1">{importResult.totalProcessed}</h4>
                  </div>
                  <div className="p-4 border border-emerald-200/50 bg-emerald-50/15 dark:border-emerald-950/30 rounded-2xl">
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold uppercase">Successes</p>
                    <h4 className="text-xl font-black mt-1 text-emerald-600 dark:text-emerald-450">{importResult.successCount}</h4>
                  </div>
                  <div className="p-4 border border-rose-200/50 bg-rose-50/15 dark:border-rose-955/30 rounded-2xl">
                    <p className="text-xs text-rose-600 dark:text-rose-500 font-semibold uppercase">Errors</p>
                    <h4 className="text-xl font-black mt-1 text-rose-600 dark:text-rose-450">{importResult.errorCount}</h4>
                  </div>
                </div>

                {/* Detailed Logs lists */}
                {importResult.errors.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Error Logs</h4>
                    <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-850 rounded-xl divide-y divide-slate-100 dark:divide-slate-850">
                      {importResult.errors.map((e, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-start gap-2 bg-rose-50/10">
                          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-rose-600">Row {e.row}:</span>
                            {e.url && <span className="text-slate-500 dark:text-slate-400 block truncate font-mono text-[10px] mt-0.5">{e.url}</span>}
                            <span className="text-slate-800 dark:text-slate-350 block mt-1">{e.error}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.successCount > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-505 uppercase tracking-wider">Successfully Imported</h4>
                    <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-850 rounded-xl divide-y divide-slate-100 dark:divide-slate-850">
                      {importResult.imported.map((url, idx) => (
                        <div key={idx} className="p-3 text-xs flex items-center justify-between gap-3 hover:bg-slate-55/15">
                          <div className="flex items-center gap-2 truncate">
                            <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="font-mono truncate text-slate-800 dark:text-slate-300">{url.originalUrl}</span>
                          </div>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                            /r/{url.customAlias || url.shortCode}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CSV Format Guide (Col Span 1) */}
        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-550 dark:text-slate-400 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" /> CSV Format Guide
            </h3>
            
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
              Your CSV file must include headers matching these exact column names. The headers are case-insensitive.
            </p>

            <div className="space-y-3">
              <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/20 text-xs space-y-1.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">originalUrl *</p>
                <p className="text-slate-500">The destination URL. Must be a valid URI containing http/https.</p>
              </div>

              <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/20 text-xs space-y-1.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">customAlias</p>
                <p className="text-slate-500">Optional alias. Alphanumeric, hyphens, and underscores only. Must be unique.</p>
              </div>

              <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/20 text-xs space-y-1.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">expiryDate</p>
                <p className="text-slate-500">Optional date. Must be formatted in valid ISO-8601 string (e.g. 2026-12-31T23:59:59Z).</p>
              </div>
            </div>

            <button
              onClick={downloadSampleCsv}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold py-3 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Template CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
