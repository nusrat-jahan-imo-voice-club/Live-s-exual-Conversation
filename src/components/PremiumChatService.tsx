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
  Lock,
  Check,
  Search,
  AlertCircle,
  X
} from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  country: 'Bangladesh' | 'India';
  image: string;
  followers: string;
}

interface Message {
  id: number;
  text: string;
  type: 'sent' | 'received';
  containsHTML?: boolean;
}

const bdNames = ['মিম', 'জুই', 'প্রিয়া', 'আনিকা', 'শিলা', 'লিসা', 'রিয়া', 'বর্ষা', 'তমা', 'মিতু', 'সাথী', 'কনক', 'নদী', 'রূপা', 'সোনিয়া', 'জেসমিন', 'শায়লা', 'নোভা', 'রুহি', 'মিলা'];
const inNames = ['প্রিয়াঙ্কা', 'দীপিকা', 'আলিয়া', 'ক্যাটরিনা', 'শ্রদ্ধা', 'কৃতি', 'দিশা', 'কিয়ারা', 'তারা', 'অনন্যা', 'জাহ্নবী', 'সারা', 'রাধিকা', 'ভূমি', 'তাপসী', 'বিদ্যা', 'সোনাক্ষী', 'পরিণীতি', 'অদিতি', 'হুমা', 'স্বরা', 'রিচা', 'কঙ্কনা', 'নেহা', 'শিল্পা', 'মাধুরী', 'কারিশমা', 'কারিনা', 'বিপাশা', 'সুস্মিতা'];

const PROFILES: Profile[] = [];
for (let i = 1; i <= 50; i++) {
  const country = (i <= 20) ? 'Bangladesh' : 'India';
  const name = (i <= 20) ? bdNames[i - 1] : inNames[i - 21];
  const userId = 2000 + i; // Use i to ensure uniqueness
  const followers = (Math.random() * 50 + 1).toFixed(1) + 'K';
  PROFILES.push({
    id: userId,
    name: name,
    country: country as any,
    image: `https://picsum.photos/seed/premium${i}/200/200`,
    followers: followers
  });
}

export default function PremiumChatService({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'LIST' | 'CHAT'>('LIST');
  const [activeTab, setActiveTab] = useState<'Bangladesh' | 'India'>('Bangladesh');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showToast, setShowToast] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const filteredProfiles = PROFILES.filter(p => p.country === activeTab);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const openChat = (profile: Profile) => {
    setSelectedProfile(profile);
    setView('CHAT');
    setMessages([]);
    
    // Bot Sequence
    setTimeout(() => {
      addMessage(`হ্যালো! <b>${profile.name}</b> এর প্রিমিয়াম প্রোফাইলে আপনাকে স্বাগতম! 💖`, 'received', true);
    }, 500);

    setTimeout(() => {
      addMessage("SERVICE_SELECTION", 'received', true);
    }, 1200);
  };

  const addMessage = (text: string, type: 'sent' | 'received', containsHTML = false) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, type, containsHTML }]);
  };

  const handleServiceSelection = (isAudio: boolean, isVideo: boolean) => {
    if (!isAudio && !isVideo) {
      console.log("দয়া করে অন্তত একটি সার্ভিস সিলেক্ট করুন।");
      return;
    }

    let responseText = "<b>সার্ভিস রেট এবং বিস্তারিত:</b><br><br>";
    if (isAudio) {
      responseText += `<b>🎧 অডিও কল সার্ভিস:</b><br>
      • ১০ মিনিট ১০০ টাকা<br>
      • ২০ মিনিট ১৫০ টাকা<br>
      • ৩০ মিনিট ২০০ টাকা<br>
      • ১ ঘন্টা ৫০০ টাকা<br><br>`;
    }
    if (isVideo) {
      responseText += `<b>📹 ভিডিও কল সার্ভিস:</b><br>
      • ১০ মিনিট ২ ২০১০ টাকা<br>
      • ৩০ মিনিট ৫১০ টাকা<br>
      • ১ ঘন্টা ১০২০ টাকা<br><br>`;
    }
    responseText += `পেমেন্ট করতে আপনার পছন্দের মানুষটির ৪ সংখ্যার User ID <b>(${selectedProfile?.id})</b> ব্যবহার করে পেমেন্ট অপশন থেকে পেমেন্ট করুন এবং রোমাঞ্চকর সময় উপভোগ করুন!<br><br>
    <i>১০০% গ্যারান্টি! পেমেন্ট করে যুক্ত হওয়ার জন্য আহবান জানাচ্ছি। ধন্যবাদ! 🌹</i>`;

    addMessage(responseText, 'received', true);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0b141a] relative overflow-hidden font-sans">
      {/* Toast Overlay */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-[350px] text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#111b21] mb-2">পেমেন্ট পেন্ডিং!</h3>
              <p className="text-sm text-[#54656f] leading-relaxed mb-6">
                সার্ভিস গ্রহণ করার জন্য পেমেন্ট নিশ্চিত করুন। অ্যাডমিন পেমেন্ট ভেরিফাই করলে এই ফিচারটি আনলক হবে।
              </p>
              <button 
                onClick={() => setShowToast(false)}
                className="w-full bg-[#00a884] text-white font-bold py-3 rounded-full active:scale-95 transition"
              >
                বুঝতে পেরেছি
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'LIST' ? (
        <div className="flex flex-col h-full bg-[#111b21]">
          <div className="flex bg-[#202c33] pt-2">
            <button 
              onClick={() => setActiveTab('Bangladesh')}
              className={`flex-1 py-4 text-base font-bold transition-all border-b-4 ${activeTab === 'Bangladesh' ? 'text-[#00a884] border-[#00a884]' : 'text-[#8696a0] border-transparent'}`}
            >
              Bangladesh
            </button>
            <button 
              onClick={() => setActiveTab('India')}
              className={`flex-1 py-4 text-base font-bold transition-all border-b-4 ${activeTab === 'India' ? 'text-[#00a884] border-[#00a884]' : 'text-[#8696a0] border-transparent'}`}
            >
              India
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pb-4">
            {filteredProfiles.map(profile => (
              <div 
                key={profile.id}
                onClick={() => openChat(profile)}
                className="flex items-center px-4 py-3 border-b border-[#202c33] hover:bg-[#202c33] transition-colors cursor-pointer"
              >
                <img 
                  src={profile.image} 
                  alt={profile.name}
                  className="w-14 h-14 rounded-full border-2 border-[#ffd700] p-0.5 object-cover"
                />
                <div className="flex-1 ml-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-white text-lg font-bold flex items-center gap-2">
                      {profile.name}
                      <span className="text-[10px] bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black px-2 py-0.5 rounded-full font-black uppercase">Premium</span>
                    </span>
                    <span className="text-[#8696a0] text-sm">Followers: {profile.followers} • ID: {profile.id}</span>
                  </div>
                  <Lock className="w-5 h-5 text-[#ffd700]" />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={onBack}
            className="m-4 bg-[#202c33] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Instagram
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full bg-[#efeae2] relative">
          {/* Chat Header */}
          <header className="bg-white h-16 flex items-center px-3 justify-between shadow-sm z-10">
            <div className="flex items-center gap-2 flex-1 overflow-hidden" onClick={() => setView('LIST')}>
              <ArrowLeft className="w-6 h-6 text-[#54656f]" />
              <img 
                src={selectedProfile?.image} 
                className="w-10 h-10 rounded-full border-2 border-[#00a884] object-cover"
                alt=""
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[#111b21] font-semibold text-lg truncate">{selectedProfile?.name}</span>
                <span className="text-[#00a884] text-xs font-medium">Premium 🔒 Online</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Video className="w-6 h-6 text-[#54656f]" onClick={() => setShowToast(true)} />
              <Phone className="w-5 h-5 text-[#54656f]" onClick={() => setShowToast(true)} />
              <MoreVertical className="w-6 h-6 text-[#54656f]" />
            </div>
          </header>

          {/* Chat Area */}
          <div 
            ref={chatAreaRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover bg-center"
          >
            <div className="flex justify-center my-2">
              <span className="bg-white text-[#667781] text-[11px] px-3 py-1 rounded-lg shadow-sm">Today</span>
            </div>
            <div className="flex justify-center mb-2">
              <div className="bg-[#ffeecd] text-[#54656f] text-[11px] px-3 py-2 rounded-xl text-center flex items-center gap-1 max-w-[90%] shadow-sm">
                <Lock className="w-3 h-3" />
                Messages and calls are end-to-end encrypted.
              </div>
            </div>

            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.type === 'sent' ? 'self-end' : 'self-start'}`}>
                <div className={`p-2.5 rounded-xl shadow-sm text-[15px] leading-relaxed relative ${msg.type === 'sent' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                  {msg.text === "SERVICE_SELECTION" ? (
                    <ServiceSelection onNext={handleServiceSelection} />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <footer className="p-2 flex items-end gap-2">
            <div className="flex-1 bg-white rounded-3xl flex items-center px-3 py-1.5 shadow-sm gap-3">
              <Smile className="w-6 h-6 text-[#54656f]" />
              <input 
                type="text" 
                placeholder="Message" 
                readOnly
                onClick={() => setShowToast(true)}
                className="flex-1 bg-transparent outline-none text-lg py-1"
              />
              <Paperclip className="w-6 h-6 text-[#54656f] -rotate-45" onClick={() => setShowToast(true)} />
              <Camera className="w-6 h-6 text-[#54656f]" onClick={() => setShowToast(true)} />
            </div>
            <button 
              onClick={() => setShowToast(true)}
              className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition"
            >
              <Mic className="w-6 h-6" />
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}

function ServiceSelection({ onNext }: { onNext: (audio: boolean, video: boolean) => void }) {
  const [audio, setAudio] = useState(false);
  const [video, setVideo] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return <div>আপনি কি ধরনের সার্ভিস চাচ্ছেন? নিচে টিক দিন:</div>;

  return (
    <div className="flex flex-col gap-2">
      <span>আপনি কি ধরনের সার্ভিস চাচ্ছেন? নিচে টিক দিন:</span>
      <div className="bg-[#f0f2f5] p-3 rounded-lg border border-gray-200 flex flex-col gap-2 mt-1">
        <label className="flex items-center gap-3 cursor-pointer font-bold text-sm">
          <input 
            type="checkbox" 
            checked={audio} 
            onChange={e => setAudio(e.target.checked)}
            className="w-4 h-4 accent-[#00a884]"
          />
          🎧 Audio Call
        </label>
        <label className="flex items-center gap-3 cursor-pointer font-bold text-sm">
          <input 
            type="checkbox" 
            checked={video} 
            onChange={e => setVideo(e.target.checked)}
            className="w-4 h-4 accent-[#00a884]"
          />
          📹 Video Call
        </label>
        <button 
          onClick={() => {
            setSubmitted(true);
            onNext(audio, video);
          }}
          className="bg-[#00a884] text-white font-bold py-2 rounded-md mt-2 active:scale-95 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
