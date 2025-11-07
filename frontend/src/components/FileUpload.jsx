import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react'; // Removed unused 'X' import
import './FileUpload.css';

function FileUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress({ filename: file.name, status: 'uploading' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress({ filename: file.name, status: 'success' });
      onUpload(data.document);

      // Clear progress after 2 seconds
      setTimeout(() => {
        setUploadProgress(null);
        setUploading(false);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({ filename: file.name, status: 'error', error: error.message });
      setTimeout(() => {
        setUploadProgress(null);
        setUploading(false);
      }, 3000);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload size={20} />
        <span>{uploading ? 'Uploading...' : '+ Upload'}</span>
      </div>

      {uploadProgress && (
        <div className={`upload-progress ${uploadProgress.status}`}>
          {uploadProgress.status === 'uploading' && (
            <span>📤 Uploading {uploadProgress.filename}...</span>
          )}
          {uploadProgress.status === 'success' && (
            <span>✅ {uploadProgress.filename} uploaded successfully!</span>
          )}
          {uploadProgress.status === 'error' && (
            <span>❌ Error: {uploadProgress.error}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
