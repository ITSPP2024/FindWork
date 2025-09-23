import React, { useState, useEffect } from 'react';
import './FileList.css';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FileList = ({ fileType, title = 'Mis archivos', allowDelete = true, refreshTrigger = 0 }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const fetchFiles = async () => {
    try {
      const response = await api.get(`/files/${user.id}`);
      const userFiles = fileType 
        ? response.data.filter(file => file.fileType === fileType)
        : response.data;
      setFiles(userFiles);
    } catch (error) {
      console.error('Error cargando archivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId, filename) => {

    setDeleting(fileId);
    try {
      await api.delete(`/files/${fileId}`);
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      // Error handled silently
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimetype, fileType) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (fileType === 'cv') return '📋';
    if (fileType === 'profile') return '👤';
    return '📎';
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/files/${file.id}/download`, {
        responseType: 'blob'
      });
      
      // Crear blob URL y descargar
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      alert('Error descargando archivo: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  if (loading) {
    return (
      <div className="file-list">
        <h4>{title}</h4>
        <div className="file-list-loading">
          <div className="loading-spinner">⏳</div>
          <p>Cargando archivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list">
      <h4>{title}</h4>
      
      {files.length === 0 ? (
        <div className="file-list-empty">
          <div className="empty-icon">📁</div>
          <p>No hay archivos subidos aún</p>
        </div>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div key={file.id} className="file-item">
              <div className="file-header">
                <div className="file-icon-name">
                  <span className="file-icon">
                    {getFileIcon(file.mimetype, file.fileType)}
                  </span>
                  <div className="file-details">
                    <span className="file-name" title={file.originalName}>
                      {file.originalName}
                    </span>
                    <span className="file-meta">
                      {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                    </span>
                  </div>
                </div>
                
                <div className="file-actions">
                  <button
                    className="action-btn download-btn"
                    onClick={() => handleDownload(file)}
                    title="Descargar"
                  >
                    ⬇️
                  </button>
                  
                  {allowDelete && (
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(file.id, file.filename)}
                      disabled={deleting === file.id}
                      title="Eliminar"
                    >
                      {deleting === file.id ? '⏳' : '🗑️'}
                    </button>
                  )}
                </div>
              </div>
              
              {file.fileType && (
                <div className="file-type-badge">
                  {file.fileType === 'cv' ? 'CV' : 
                   file.fileType === 'profile' ? 'Foto' : 'Documento'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;