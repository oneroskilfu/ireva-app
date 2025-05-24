import { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send, PhoneCall, Paperclip, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

// Mock messages for demonstration
const demoMessages = [
  { 
    id: 1, 
    sender: 'agent', 
    content: 'Hello! Welcome to iREVA. How can I help you today?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5) 
  }
];

interface Message {
  id: number;
  sender: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate agent typing when user sends a message
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      setIsTyping(true);
      
      timeout = setTimeout(() => {
        setIsTyping(false);
        
        // Automated responses based on keywords
        const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
        
        let response = "Thank you for your message. One of our investment advisors will get back to you shortly.";
        
        if (lastUserMessage.includes('invest') || lastUserMessage.includes('property')) {
          response = "Great question about our investment opportunities! We have various properties with different minimum investment amounts starting from ₦100,000. Would you like me to show you some of our featured projects?";
        } else if (lastUserMessage.includes('kyc') || lastUserMessage.includes('verify')) {
          response = "Our KYC process is straightforward! You'll need to provide a government-issued ID and proof of address. You can complete this process on your account dashboard after registration.";
        } else if (lastUserMessage.includes('return') || lastUserMessage.includes('roi')) {
          response = "Our properties offer returns ranging from 12-18% annually, depending on the property type and location. Would you like to discuss specific investment options?";
        } else if (lastUserMessage.includes('hello') || lastUserMessage.includes('hi')) {
          response = "Hello! Welcome to iREVA. How can I assist you with your real estate investment journey today?";
        } else if (lastUserMessage.includes('minimum') || lastUserMessage.includes('start')) {
          response = "Our minimum investment starts at ₦100,000 for entry-level opportunities, with premium properties requiring ₦500,000+. We designed these tiers to make real estate investing accessible to more Nigerians.";
        } else if (lastUserMessage.includes('location') || lastUserMessage.includes('where')) {
          response = "We currently offer investment opportunities in major Nigerian cities including Lagos, Abuja, Port Harcourt, and Ibadan. We're also expanding to other emerging markets across Africa in the near future.";
        } else if (lastUserMessage.includes('risk') || lastUserMessage.includes('safe')) {
          response = "Every investment carries some risk, but we minimize this through rigorous property vetting, legal due diligence, and insurance coverage. We also diversify our portfolio across different property types and locations to further reduce risk exposure.";
        } else if (lastUserMessage.includes('payment') || lastUserMessage.includes('pay')) {
          response = "We offer multiple payment options including bank transfers, card payments, and digital wallets. All transactions are processed securely, and you'll receive instant confirmation of your investment.";
        } else if (lastUserMessage.includes('withdraw') || lastUserMessage.includes('cash out')) {
          response = "You can request a withdrawal through your investor dashboard. Standard investments have a 5-year maturity period, but we offer flexible exit options with terms clearly outlined in your investment agreement.";
        } else if (lastUserMessage.includes('how') && lastUserMessage.includes('work')) {
          response = "iREVA works by pooling funds from multiple investors to purchase carefully vetted real estate assets. You receive returns based on rental income and property appreciation. Our platform handles all property management, making it a truly passive investment for you.";
        } else if (lastUserMessage.includes('document') || lastUserMessage.includes('paperwork')) {
          response = "We provide all necessary documentation electronically, including your investment certificate, property details, and quarterly performance reports. All documents are securely stored in your account dashboard for easy access.";
        } else if (lastUserMessage.includes('tax')) {
          response = "While we can provide general information, we recommend consulting with a tax professional regarding your specific situation. We do provide annual statements that summarize your investment income for tax reporting purposes.";
        } else if (lastUserMessage.includes('register') || lastUserMessage.includes('sign up')) {
          response = "You can register for an account by clicking the 'Sign Up' button at the top of our website. The process takes just a few minutes, and you'll need to provide basic information and complete our KYC verification before making your first investment.";
        } else if (lastUserMessage.includes('contact') || lastUserMessage.includes('phone')) {
          response = "You can reach our customer support team at support@ireva.com or call +234 803 639 9665. Our office hours are Monday to Friday, 9am to 5pm Nigerian time.";
        }
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'agent',
          content: response,
          timestamp: new Date()
        }]);
        
      }, 1500);
    }
    
    return () => clearTimeout(timeout);
  }, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'user',
        content: newMessage.trim(),
        timestamp: new Date()
      }]);
      
      setNewMessage('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const openWhatsApp = () => {
    // Using the business WhatsApp number
    window.open('https://wa.me/2348036399665?text=Hello%20iREVA%2C%20I%27m%20interested%20in%20learning%20more%20about%20your%20investment%20opportunities.');
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed z-50 bottom-6 right-6"
          >
            <Button 
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
            >
              <MessageSquare className="w-7 h-7" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-50 bottom-6 right-6 w-[380px] max-w-[calc(100vw-48px)] rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col"
            style={{ height: 'calc(min(700px, 80vh))' }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="mr-3 h-10 w-10 border-2 border-white">
                  <AvatarImage src="/logo.png" alt="iREVA" />
                  <AvatarFallback className="bg-indigo-800 text-white">IR</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-lg">iREVA Support</div>
                  <div className="text-xs opacity-80">Online | Typically replies in minutes</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Mode Tabs */}
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="flex-1">Live Chat</TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex-1">WhatsApp</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="m-0 flex flex-col h-[calc(100%-92px)]">
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'agent' && (
                        <Avatar className="mr-2 h-8 w-8 self-end mb-1">
                          <AvatarImage src="/logo.png" alt="iREVA Agent" />
                          <AvatarFallback className="bg-indigo-800 text-white text-xs">IR</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <div
                          className={`p-3 rounded-2xl max-w-[calc(100%-60px)] ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {message.content}
                        </div>
                        <span className={`text-xs mt-1 text-gray-500 ${message.sender === 'user' ? 'self-end' : 'self-start'}`}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-center mb-4">
                      <Avatar className="mr-2 h-8 w-8">
                        <AvatarImage src="/logo.png" alt="iREVA Agent" />
                        <AvatarFallback className="bg-indigo-800 text-white text-xs">IR</AvatarFallback>
                      </Avatar>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none max-w-xs border border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input */}
                <div className="p-3 border-t dark:border-gray-800 bg-white dark:bg-gray-950">
                  <div className="flex items-end">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="min-h-[60px] flex-1 focus-visible:ring-1 focus-visible:ring-offset-0 resize-none"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => {}}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="whatsapp" className="m-0 flex flex-col h-[calc(100%-92px)]">
                <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  <div className="w-20 h-20 mb-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28z"/>
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                    Chat with us on WhatsApp
                  </h3>
                  
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-sm">
                    Get instant responses from our investment advisors directly on WhatsApp
                  </p>
                  
                  <Button 
                    onClick={openWhatsApp}
                    className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-white gap-2 h-12 font-medium"
                  >
                    Connect on WhatsApp
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <PhoneCall className="h-4 w-4 mr-2" />
                    <span>Or call us: +234 803 639 9665</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}