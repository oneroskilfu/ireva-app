import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth.js';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Users, 
  Send, 
  RefreshCcw, 
  Loader2, 
  Mail, 
  Eye, 
  EyeOff, 
  Trash2,
  User,
} from 'lucide-react';

interface Message {
  _id?: string;
  id?: number;
  sender?: string;
  receiver: string;
  content: string;
  read?: boolean;
  createdAt?: string;
  receiverDetails?: {
    name?: string;
    email?: string;
  };
  senderDetails?: {
    name?: string;
    email?: string;
  };
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sentOnly, setSentOnly] = useState(false);
  
  // Form state
  const [isComposing, setIsComposing] = useState(false);
  const [formData, setFormData] = useState({
    receiver: '',
    content: ''
  });
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<{id: string; name: string; email: string}[]>([]);
  
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/messages', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again later.');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      // Don't show toast since this is a supplementary feature
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.receiver || !formData.content) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSending(true);
      await axios.post('/api/messages', formData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setFormData({
        receiver: '',
        content: ''
      });
      setIsComposing(false);
      setSending(false);
      
      toast({
        title: 'Message Sent',
        description: 'Your message has been successfully sent',
      });
      
      fetchMessages();
    } catch (err: any) {
      setSending(false);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const markAsRead = async (id: string | number) => {
    try {
      await axios.patch(`/api/messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      // Update local state
      setMessages(messages.map(message => 
        message._id === id || message.id === id 
          ? { ...message, read: true } 
          : message
      ));
      
      toast({
        title: 'Message marked as read',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update message status',
        variant: 'destructive'
      });
    }
  };

  const deleteMessage = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      // Update local state
      setMessages(messages.filter(message => message._id !== id && message.id !== id));
      
      toast({
        title: 'Message Deleted',
        description: 'The message has been successfully deleted',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete message',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  // Filter messages based on search and filters
  const filteredMessages = messages.filter(message => {
    const receiverName = message.receiverDetails?.name || message.receiver;
    const senderName = message.senderDetails?.name || message.sender || 'System';
    const content = message.content || '';
    
    const matchesSearch = searchTerm === '' || 
      receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUnread = !unreadOnly || message.read === false;
    const matchesSent = !sentOnly || !!message.sender;
    
    return matchesSearch && matchesUnread && matchesSent;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-NG', {
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl ml-72">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Messaging Center</h1>
          <p className="text-gray-500">Communicate with investors & developers</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={fetchMessages}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded flex items-center"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCcw className="h-5 w-5 mr-2" />}
            Refresh
          </button>
          <button 
            onClick={() => setIsComposing(!isComposing)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors flex items-center"
          >
            {isComposing ? 'Cancel' : (
              <>
                <Mail className="h-5 w-5 mr-2" />
                Compose Message
              </>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {isComposing && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Compose New Message</h2>
          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recipient*</label>
              {users.length > 0 ? (
                <select
                  name="receiver"
                  value={formData.receiver}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a recipient</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="receiver"
                  value={formData.receiver}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="User ID or Email"
                  required
                />
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Message*</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={5}
                placeholder="Type your message here..."
                required
              ></textarea>
            </div>
            
            <div className="text-right">
              <button
                type="submit"
                disabled={sending}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                {sending ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4"
              placeholder="Search messages..."
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={unreadOnly} 
                onChange={() => setUnreadOnly(!unreadOnly)}
                className="rounded text-primary"
              />
              <span>Unread only</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={sentOnly} 
                onChange={() => setSentOnly(!sentOnly)}
                className="rounded text-primary"
              />
              <span>Sent by me</span>
            </label>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium">No messages found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || unreadOnly || sentOnly 
                ? 'Try adjusting your search filters' 
                : 'Your inbox is empty. Create a new message to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <tr key={message._id || message.id} className={`hover:bg-gray-50 ${!message.read ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!message.read ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Unread
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Read
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {message.senderDetails?.name || message.sender || 'System'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {message.senderDetails?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {message.receiverDetails?.name || message.receiver}
                          </div>
                          <div className="text-xs text-gray-500">
                            {message.receiverDetails?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${!message.read ? 'font-semibold' : 'text-gray-700'}`}>
                        {message.content.length > 100 
                          ? `${message.content.substring(0, 100)}...` 
                          : message.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {!message.read && (
                          <button 
                            onClick={() => markAsRead(message._id || message.id!)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Mark as read"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteMessage(message._id || message.id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete message"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Messaging Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="p-3 rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold">{messages.length}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="p-3 rounded-full bg-amber-100">
              <EyeOff className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unread Messages</p>
              <p className="text-2xl font-bold">
                {messages.filter(m => !m.read).length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="p-3 rounded-full bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Conversations</p>
              <p className="text-2xl font-bold">
                {new Set(messages.map(m => m.receiver)).size}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;