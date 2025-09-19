import React, { useState, useRef } from 'react';
import './FileUpload.css';
import api from '../services/api';

const FileUpload = ({ 
  fileType = 'documents', 
  accept, 
  maxSize = 10 * 1024 * 1024, // 10MB
  onUploadSuccess,
  onUploadError,
  label = 'Subir archivo',
  description = 'Arrastra aquí tu archivo o haz clic para seleccionar'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validar tamaño
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      const error = `El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`;
      onUploadError?.(error);
      return;
    }

    // Validar tipo si se especifica accept
    if (accept && !accept.split(',').some(type => {
      const trimmedType = type.trim();
      if (trimmedType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(trimmedType.toLowerCase());
      }
      return file.type.includes(trimmedType.replace('*', ''));
    })) {
      const error = `Tipo de archivo no permitido. Formatos aceptados: ${accept}`;
      onUploadError?.(error);
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onUploadSuccess?.(response.data.file);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error subiendo archivo';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileTypeIcon = () => {
    switch (fileType) {
      case 'profile':
        return '🖼️';
      case 'cv':
        return '📄';
      default:
        return '📎';
    }
  };

  return (
    <div className="file-upload">
      <label className="file-upload-label">{label}</label>
      
      <div 
        className={`file-upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="file-input-hidden"
        />
        
        <div className="file-upload-content">
          {uploading ? (
            <>
              <div className="upload-spinner">⏳</div>
              <p>Subiendo archivo...</p>
            </>
          ) : (
            <>
              <div className="file-icon">{getFileTypeIcon()}</div>
              <p className="upload-description">{description}</p>
              <button type="button" className="upload-button">
                Seleccionar archivo
              </button>
            </>
          )}
        </div>
      </div>
      
      {accept && (
        <p className="file-upload-hint">
          Formatos: {accept.replace(/\*/g, '')} | Máximo: {Math.round(maxSize / (1024 * 1024))}MB
        </p>
      )}
    </div>
  );
};

export default FileUpload;