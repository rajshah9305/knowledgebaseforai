import React from 'react';
import { FileText, Trash2, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import './DocumentList.css';

function DocumentList({ documents, selectedDocuments, onSelect, onDelete, onRefresh }) {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('text') || fileType.includes('markdown')) return '📄';
    return '📎';
  };

  const handleDelete = async (e, documentId) => {
    e.stopPropagation();
    // FIXED: Removed window.confirm() which is blocked in many environments and fails silently.
    // You should replace this with a custom modal for a better user experience.
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        onDelete(documentId);
      } else {
        // Use console.error instead of alert
        console.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="document-list">
      <div className="document-list-header">
        <button onClick={onRefresh} className="refresh-btn" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="document-list-content">
        {documents.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>No documents yet</p>
            <p className="hint">Upload your first document to get started</p>
          </div>
        ) : (
          documents.map((doc) => {
            const isSelected = selectedDocuments.includes(doc.id);
            return (
              <div
                key={doc.id}
                className={`document-item ${isSelected ? 'selected' : ''} ${!doc.processed && !doc.error ? 'processing' : ''} ${doc.error ? 'error' : ''}`}
                onClick={() => onSelect(doc.id)}
              >
                <div className="document-item-header">
                  <div className="document-icon">
                    {getFileIcon(doc.file_type)}
                  </div>
                  <div className="document-info">
                    <div className="document-name" title={doc.filename}>
                      {doc.filename}
                    </div>
                    <div className="document-meta">
                      {formatFileSize(doc.file_size)}
                      {doc.error ? (
                        <span className="status error" title={doc.error}>⚠ Error</span>
                      ) : doc.processed ? (
                        <span className="status processed">✓ Processed</span>
                      ) : (
                        <span className="status processing">⏳ Processing...</span>
                      )}
                    </div>
                  </div>
                  <div className="document-actions">
                    {isSelected ? (
                      <CheckCircle2 size={18} className="selected-icon" />
                    ) : (
                      <Circle size={18} className="unselected-icon" />
                    )}
                    <button
                      onClick={(e) => handleDelete(e, doc.id)}
                      className="delete-btn"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default DocumentList;
