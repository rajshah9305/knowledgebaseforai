import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText } from 'lucide-react';
import './ChatInterface.css';

function ChatInterface({ selectedDocuments, documents }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          documentIds: selectedDocuments.length > 0 ? selectedDocuments : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add AI response
      const aiMessage = {
        role: 'assistant',
        content: data.response,
        sources: data.sources || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        error: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // This function was defined but never used, so it's safe to remove or keep.
  // I've left it commented out for clarity.
  // const getDocumentName = (documentId) => {
  //   const doc = documents.find(d => d.id === documentId);
  //   return doc ? doc.filename : 'Unknown';
  // };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>💬 Ask anything about your documents...</h2>
        {selectedDocuments.length > 0 && (
          <div className="selected-docs-hint">
            Querying {selectedDocuments.length} selected document{selectedDocuments.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <Bot size={48} />
            <p>Start a conversation</p>
            <p className="hint">Ask questions about your uploaded documents</p>
            <div className="example-questions">
              <p>Try asking:</p>
              <ul>
                <li>"Summarize the main points from the documents"</li>
                <li>"What does the document say about..."</li>
                <li>"Find all mentions of..."</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.role} ${message.error ? 'error' : ''}`}>
              <div className="message-avatar">
                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                {message.sources && message.sources.length > 0 && (
                  <div className="message-sources">
                    <div className="sources-header">Sources:</div>
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="source-item">
                        <FileText size={14} />
                        <span>
                          {source.filename}
                          {source.preview && (
                            <span className="source-preview"> - {source.preview}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          disabled={loading}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="send-button"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;
