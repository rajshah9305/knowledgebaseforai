import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (newDocument) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  const handleDocumentDelete = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setSelectedDocuments(prev => prev.filter(id => id !== documentId));
  };

  const toggleDocumentSelection = (documentId) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧠 Omniscient</h1>
        <p className="subtitle">Universal AI Knowledge Base</p>
      </header>

      <main className="app-main">
        <div className="left-panel">
          <div className="panel-header">
            <h2>📁 Your Documents ({documents.length})</h2>
            <FileUpload onUpload={handleFileUpload} />
          </div>
          
          {loading ? (
            <div className="loading">Loading documents...</div>
          ) : (
            <DocumentList
              documents={documents}
              selectedDocuments={selectedDocuments}
              onSelect={toggleDocumentSelection}
              onDelete={handleDocumentDelete}
              onRefresh={fetchDocuments}
            />
          )}
        </div>

        <div className="right-panel">
          <ChatInterface
            selectedDocuments={selectedDocuments}
            documents={documents}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
