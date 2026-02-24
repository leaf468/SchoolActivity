import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  onFileAnalyze?: (file: File) => Promise<void>;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  showPreview?: boolean;
  className?: string;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelect,
  onFileAnalyze,
  acceptedFileTypes = ['.pdf'],
  maxFileSize = 10,
  showPreview = true,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Check file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!acceptedFileTypes.includes(fileExtension)) {
        setError(`허용된 파일 형식: ${acceptedFileTypes.join(', ')}`);
        return;
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSize) {
        setError(`파일 크기는 ${maxFileSize}MB 이하여야 합니다`);
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      if (showPreview) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }

      onFileSelect(file);

      // Run analysis if callback provided
      if (onFileAnalyze) {
        setIsAnalyzing(true);
        try {
          await onFileAnalyze(file);
        } catch (err) {
          setError('파일 분석 중 오류가 발생했습니다');
        } finally {
          setIsAnalyzing(false);
        }
      }
    },
    [acceptedFileTypes, maxFileSize, showPreview, onFileSelect, onFileAnalyze]
  );

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsAnalyzing(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
              isDragging
                ? 'border-purple-500 bg-purple-50 scale-[1.02]'
                : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
            />

            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <motion.div
                animate={{
                  scale: isDragging ? 1.1 : 1,
                  rotate: isDragging ? 5 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {error ? (
                  <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
                ) : (
                  <DocumentArrowUpIcon
                    className={`w-16 h-16 mb-4 transition-colors ${
                      isDragging ? 'text-purple-600' : 'text-gray-400'
                    }`}
                  />
                )}
              </motion.div>

              <p
                className={`text-lg font-semibold mb-2 ${
                  error ? 'text-red-700' : isDragging ? 'text-purple-700' : 'text-gray-700'
                }`}
              >
                {error ? '파일 오류' : isDragging ? '파일을 여기에 놓으세요' : '생기부 PDF 파일 업로드'}
              </p>

              {error ? (
                <p className="text-sm text-red-600 mb-4">{error}</p>
              ) : (
                <p className="text-sm text-gray-500 mb-4">
                  파일을 드래그하거나 클릭하여 업로드하세요
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>허용 형식: {acceptedFileTypes.join(', ')}</span>
                <span>•</span>
                <span>최대 {maxFileSize}MB</span>
              </div>
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative border-2 rounded-xl p-6 ${
              isAnalyzing
                ? 'border-purple-300 bg-purple-50'
                : 'border-green-300 bg-green-50'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Preview or Icon */}
              {showPreview && previewUrl ? (
                <div className="flex-shrink-0 w-20 h-28 bg-white rounded-lg border-2 border-gray-300 overflow-hidden relative group">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full pointer-events-none scale-150 origin-top-left"
                    title={`Preview of ${selectedFile.name}`}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className={`p-3 rounded-lg ${isAnalyzing ? 'bg-purple-100' : 'bg-green-100'}`}>
                  <DocumentTextIcon className={`w-8 h-8 ${isAnalyzing ? 'text-purple-600' : 'text-green-600'}`} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isAnalyzing ? (
                    <ArrowPathIcon className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" />
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                  <h3 className={`font-semibold truncate ${isAnalyzing ? 'text-purple-900' : 'text-green-900'}`}>
                    {selectedFile.name}
                  </h3>
                </div>
                <p className={`text-sm ${isAnalyzing ? 'text-purple-700' : 'text-green-700'}`}>
                  {formatFileSize(selectedFile.size)} • {isAnalyzing ? 'AI 분석 중...' : '업로드 완료'}
                </p>

                {isAnalyzing && (
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-purple-600 animate-pulse" style={{ width: '100%' }} />
                  </div>
                )}
              </div>

              <button
                onClick={handleRemoveFile}
                className={`p-2 rounded-lg transition-colors ${
                  isAnalyzing ? 'hover:bg-purple-100' : 'hover:bg-green-100'
                }`}
                title="파일 제거"
              >
                <XMarkIcon className={`w-5 h-5 ${isAnalyzing ? 'text-purple-700' : 'text-green-700'}`} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileDropZone;
