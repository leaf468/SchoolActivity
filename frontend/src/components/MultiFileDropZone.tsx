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

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'analyzing' | 'complete' | 'error';
  progress: number;
  error?: string;
  previewUrl?: string;
}

interface MultiFileDropZoneProps {
  onFilesSelect: (files: File[]) => void;
  onFileAnalyze?: (file: File) => Promise<void>;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

const MultiFileDropZone: React.FC<MultiFileDropZoneProps> = ({
  onFilesSelect,
  onFileAnalyze,
  acceptedFileTypes = ['.pdf'],
  maxFileSize = 10,
  maxFiles = 10,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const validateFile = (file: File): string | null => {
        // Check file type
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!acceptedFileTypes.includes(fileExtension)) {
          return `허용된 파일 형식: ${acceptedFileTypes.join(', ')}`;
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
          return `파일 크기는 ${maxFileSize}MB 이하여야 합니다`;
        }

        return null;
      };
      setError(null);

      const fileArray = Array.from(files);

      // Check max files
      if (uploadedFiles.length + fileArray.length > maxFiles) {
        setError(`최대 ${maxFiles}개의 파일만 업로드 가능합니다`);
        return;
      }

      const validFiles: File[] = [];
      const newUploadedFiles: UploadedFile[] = [];

      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        validFiles.push(file);
        const fileId = `${file.name}-${Date.now()}-${Math.random()}`;

        // Create preview URL for PDF
        const previewUrl = URL.createObjectURL(file);

        newUploadedFiles.push({
          file,
          id: fileId,
          status: 'uploading',
          progress: 0,
          previewUrl,
        });
      }

      if (validFiles.length === 0) return;

      setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
      onFilesSelect(validFiles);

      // Simulate upload and analysis
      for (const uploadedFile of newUploadedFiles) {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, progress } : f
            )
          );
        }

        // Start analysis
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: 'analyzing', progress: 0 }
              : f
          )
        );

        try {
          if (onFileAnalyze) {
            await onFileAnalyze(uploadedFile.file);
          } else {
            // Simulate analysis
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id
                ? { ...f, status: 'complete', progress: 100 }
                : f
            )
          );
        } catch (err) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id
                ? { ...f, status: 'error', error: '분석 실패' }
                : f
            )
          );
        }
      }
    },
    [acceptedFileTypes, maxFileSize, maxFiles, uploadedFiles.length, onFilesSelect, onFileAnalyze]
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
      handleFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'analyzing':
        return <ArrowPathIcon className="w-5 h-5 text-purple-600 animate-spin" />;
      case 'complete':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = (file: UploadedFile): string => {
    switch (file.status) {
      case 'uploading':
        return `업로드 중... ${file.progress}%`;
      case 'analyzing':
        return 'AI 분석 중...';
      case 'complete':
        return '분석 완료';
      case 'error':
        return file.error || '오류 발생';
    }
  };

  const getStatusColor = (status: UploadedFile['status']): string => {
    switch (status) {
      case 'uploading':
        return 'border-blue-300 bg-blue-50';
      case 'analyzing':
        return 'border-purple-300 bg-purple-50';
      case 'complete':
        return 'border-green-300 bg-green-50';
      case 'error':
        return 'border-red-300 bg-red-50';
    }
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <motion.div
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
          id="multi-file-upload"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInput}
          multiple
          className="hidden"
        />

        <label
          htmlFor="multi-file-upload"
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
              여러 파일을 드래그하거나 클릭하여 업로드하세요
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>허용 형식: {acceptedFileTypes.join(', ')}</span>
            <span>•</span>
            <span>최대 {maxFileSize}MB</span>
            <span>•</span>
            <span>최대 {maxFiles}개 파일</span>
          </div>
        </label>
      </motion.div>

      {/* Uploaded Files List */}
      <AnimatePresence mode="popLayout">
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">
                업로드된 파일 ({uploadedFiles.length}/{maxFiles})
              </h3>
              {uploadedFiles.filter((f) => f.status === 'complete').length > 0 && (
                <span className="text-xs text-green-600 font-medium">
                  {uploadedFiles.filter((f) => f.status === 'complete').length}개 분석 완료
                </span>
              )}
            </div>

            {uploadedFiles.map((uploadedFile) => (
              <motion.div
                key={uploadedFile.id}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className={`relative border-2 rounded-xl p-4 ${getStatusColor(uploadedFile.status)}`}
              >
                <div className="flex items-start gap-4">
                  {/* Preview Thumbnail */}
                  <div className="flex-shrink-0">
                    {uploadedFile.previewUrl ? (
                      <div className="w-16 h-20 bg-white rounded-lg border-2 border-gray-300 overflow-hidden relative group">
                        <iframe
                          src={uploadedFile.previewUrl}
                          className="w-full h-full pointer-events-none scale-150 origin-top-left"
                          title={`Preview of ${uploadedFile.file.name}`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                          <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(uploadedFile.status)}
                      <h4 className="font-semibold text-gray-900 truncate text-sm">
                        {uploadedFile.file.name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {formatFileSize(uploadedFile.file.size)} • {getStatusText(uploadedFile)}
                    </p>

                    {/* Progress Bar */}
                    {(uploadedFile.status === 'uploading' || uploadedFile.status === 'analyzing') && (
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: uploadedFile.status === 'analyzing' ? '100%' : `${uploadedFile.progress}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full ${
                            uploadedFile.status === 'uploading' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}
                          style={{
                            animation: uploadedFile.status === 'analyzing' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFile(uploadedFile.id)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
                    title="파일 제거"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiFileDropZone;
