import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader, MessageCircle, User } from 'lucide-react';
import messageService from '../services/messageService';
import { useAuth } from '../context/AuthContext';

const MessageThreadPanel = ({ 
  isOpen, 
  onClose, 
  applicationId,
  candidateName 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && applicationId) {
      loadMessages();
    }
  }, [isOpen, applicationId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await messageService.getThread(applicationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    try {
      setSending(true);
      const newMessage = await messageService.sendMessage({
        applicationId,
        body: messageText.trim(),
      });

      // Add new message to the list
      setMessages([...messages, newMessage]);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-semibold">Messages</h3>
              {candidateName && (
                <p className="text-sm text-indigo-100">{candidateName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-indigo-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages List */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No messages yet
              </h4>
              <p className="text-sm text-gray-600">
                Start the conversation by sending a message below
              </p>
            </div>
          )}

          {!loading && messages.map((message) => {
            const isOwnMessage = message.senderUserId === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isOwnMessage ? 'bg-indigo-100' : 'bg-gray-200'
                }`}>
                  <User className={`w-4 h-4 ${
                    isOwnMessage ? 'text-indigo-600' : 'text-gray-600'
                  }`} />
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-lg px-4 py-2 ${
                    isOwnMessage 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    {!isOwnMessage && (
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.body}
                    </p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${
                    isOwnMessage ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.sentAt)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default MessageThreadPanel;
