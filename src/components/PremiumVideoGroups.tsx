import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle, 
  Play,
  X,
  ChevronLeft
} from 'lucide-react';
// Removed Firebase logic as per user request
interface VideoGroup {
  id: string;
  name: string;
  image: string;
  previewVideo: string;
  isPremium: boolean;
  price: number;
  members: string;
}

interface FirebaseVideo {
  url: string;
  timestamp: number;
}

const baseNames = ['দেশী ভাইরাল ভিডিও', 'পারিবারিক গোপন ভিডিও', 'টিকটক লিকস কালেকশন', 'স্কুল কলেজের ভাইরাল', 'হিডেন ক্যামেরা কালেকশন', 'প্রাইভেট ভিডিও হাব', 'এক্সক্লুসিভ দেশী জোন'];

const VIDEO_GROUPS: VideoGroup[] = [];
for (let i = 1; i <= 50; i++) {
  let isPremium = false;
  if (i >= 6 && i <= 15) isPremium = true;
  if (i >= 21 && i <= 50) isPremium = true;

  let price = Math.floor(Math.random() * (500 - 200 + 1)) + 200;

  VIDEO_GROUPS.push({
    id: `grp_100${i}`,
    name: `${baseNames[i % baseNames.length]} - Part ${i}`,
    image: `/assets/groups/images/group${i}.jpg`,
    previewVideo: `/assets/groups/previews/preview${i}.mp4`, 
    isPremium: isPremium,
    price: price,
    members: (Math.random() * 50 + 10).toFixed(1) + 'K'
  });
}

export default function PremiumVideoGroups({ onBack, onGetPremium }: { onBack: () => void, onGetPremium: (group: VideoGroup) => void }) {
  const [view, setView] = useState<'LIST' | 'INBOX'>('LIST');
  const [selectedGroup, setSelectedGroup] = useState<VideoGroup | null>(null);
  const [groupVideos, setGroupVideos] = useState<FirebaseVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const inboxMessageAreaRef = useRef<HTMLDivElement>(null);

  const openGroup = (group: VideoGroup) => {
    if (group.isPremium) {
      onGetPremium(group);
      return;
    }
    setSelectedGroup(group);
    setView('INBOX');
    setLoading(true);
  };

  useEffect(() => {
    if (view === 'INBOX' && selectedGroup) {
      setLoading(true);
      // Simulate loading static videos instead of Firebase
      setTimeout(() => {
        setGroupVideos([
          { url: '/assets/groups/unlocked/unlocked1.mp4', timestamp: Date.now() },
          { url: '/assets/groups/unlocked/unlocked2.mp4', timestamp: Date.now() - 3600000 },
          { url: '/assets/groups/unlocked/unlocked3.mp4', timestamp: Date.now() - 7200000 }
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [view, selectedGroup]);

  useEffect(() => {
    if (inboxMessageAreaRef.current) {
      inboxMessageAreaRef.current.scrollTop = inboxMessageAreaRef.current.scrollHeight;
    }
  }, [groupVideos]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0f0f] text-white relative overflow-hidden font-sans">
      {view === 'LIST' ? (
        <div className="flex flex-col h-full overflow-y-auto">
          <header className="flex items-center p-4 bg-[#212121] border-b border-[#333] sticky top-0 z-10">
            <button onClick={onBack} className="mr-4">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">🎥 Premium Video Groups</h2>
          </header>

          <div className="flex-1 pb-20">
            {VIDEO_GROUPS.map(group => (
              <div key={group.id} className="bg-[#212121] mb-4 flex flex-col">
                <div 
                  className="flex items-center p-3 cursor-pointer"
                  onClick={() => openGroup(group)}
                >
                  <img 
                    src={group.image} 
                    className={`w-10 h-10 rounded-full object-cover border-2 ${group.isPremium ? 'border-[#ffd700]' : 'border-[#00a884]'}`}
                    alt=""
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-1 font-semibold">
                      {group.name} {group.isPremium ? '👑' : <CheckCircle className="w-3 h-3 text-[#00a884]" />}
                    </div>
                    <div className="text-[#aaaaaa] text-xs">{group.members} Members • Unlimited Videos</div>
                  </div>
                  {group.isPremium ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); openGroup(group); }}
                      className="bg-[#ffd700] text-black px-4 py-1.5 rounded-full font-bold text-sm"
                    >
                      👑 Get Premium
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); openGroup(group); }}
                      className="bg-white/10 text-white px-4 py-1.5 rounded-full font-bold text-sm"
                    >
                      Join Group
                    </button>
                  )}
                </div>

                <div className="relative w-full aspect-video bg-black overflow-hidden">
                  {group.isPremium && (
                    <div 
                      className="absolute inset-0 bg-black/70 backdrop-blur-md z-10 flex flex-col items-center justify-center text-[#ffd700] cursor-pointer"
                      onClick={() => openGroup(group)}
                    >
                      <Lock className="w-12 h-12 mb-2" />
                      <span className="text-lg font-bold text-white">Premium Group - {group.price} BDT</span>
                    </div>
                  )}
                  <video 
                    src={group.previewVideo} 
                    className={`w-full h-full object-cover ${group.isPremium ? 'blur-lg' : ''}`}
                    controls={!group.isPremium}
                    muted
                    loop
                    playsInline
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full bg-[#0b141a] absolute inset-0 z-50">
          <header className="bg-[#202c33] p-3 flex items-center h-16 shadow-md">
            <button onClick={() => setView('LIST')} className="mr-4">
              <ChevronLeft className="w-7 h-7 text-white" />
            </button>
            <img 
              src={selectedGroup?.image} 
              className="w-10 h-10 rounded-full object-cover mr-3"
              alt=""
            />
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{selectedGroup?.name}</span>
              <span className="text-[#8696a0] text-xs">Only admins can send videos</span>
            </div>
          </header>

          <div 
            ref={inboxMessageAreaRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-cover bg-center"
          >
            {loading && (
              <div className="flex flex-col items-center justify-center mt-10">
                <div className="w-8 h-8 border-4 border-white/20 border-t-[#00a884] rounded-full animate-spin mb-2"></div>
                <span className="text-[#8696a0]">Loading encrypted videos...</span>
              </div>
            )}

            {!loading && groupVideos.length === 0 && (
              <div className="text-center text-[#8696a0] mt-20">
                No videos uploaded yet in this group. Wait for admin update!
              </div>
            )}

            {groupVideos.map((vid, idx) => (
              <div key={idx} className="bg-[#202c33] p-1.5 rounded-xl shadow-lg w-full max-w-[90%] self-start">
                <video 
                  src={vid.url} 
                  controls 
                  className="w-full rounded-lg bg-black aspect-video object-contain"
                />
                <div className="text-right text-[10px] text-[#8696a0] mt-1 pr-1">
                  {(() => {
                    const d = new Date();
                    d.setTime(vid.timestamp || Date.now());
                    let h = d.getHours();
                    const m = d.getMinutes();
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    h = h % 12 || 12;
                    const mStr = m < 10 ? '0' + m : m.toString();
                    return h + ':' + mStr + ' ' + ampm;
                  })()}
                </div>
              </div>
            ))}
          </div>

          <footer className="bg-[#202c33] p-3 text-center text-[#8696a0] text-sm italic border-t border-[#2a3942]">
            🔒 This group is strictly for watching videos. Messaging is disabled.
          </footer>
        </div>
      )}
    </div>
  );
}
