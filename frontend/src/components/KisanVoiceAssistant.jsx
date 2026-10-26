import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, MessageSquare, ArrowRight, Bot, ShieldCheck } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

const BCP47_MAP = {
  hi: 'hi-IN',
  pa: 'pa-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  as: 'as-IN',
  ur: 'ur-IN',
  ne: 'ne-NP',
  en: 'en-IN',
};

const QUICK_COMMANDS = [
  { text: '🚜 Find Tractors & Harvesters', query: 'Show me tractors for rent', action: '/equipment' },
  { text: '🌾 Check Mandi Wheat Price', query: 'What is wheat mandi rate today?', action: 'price' },
  { text: '🚛 Find Shared Mandi Freight', query: 'Find mandi transport pooling', action: '/mandi' },
  { text: '🗺️ Open Live GPS Radar', query: 'Track tractors on live map', action: '/map' },
  { text: '💰 Pay via UPI / Escrow', query: 'Open UPI payment desk', action: '/payment' },
];

export default function KisanVoiceAssistant() {
  const navigate = useNavigate();
  const { currentLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const handleCommandRef = useRef(null);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = BCP47_MAP[currentLang] || 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceCommand = (rawText) => {
    const q = rawText.toLowerCase();
    let reply;

    if (q.includes('tractor') || q.includes('equipment') || q.includes('rotavator') || q.includes('rent') || q.includes('ट्रैक्टर')) {
      reply = 'Opening verified peer-to-peer equipment marketplace. You can filter by tractors, harvesters, and sprayers.';
      navigate('/equipment');
    } else if (q.includes('wheat') || q.includes('price') || q.includes('rate') || q.includes('mandi price') || q.includes('गेहूं') || q.includes('भाव')) {
      reply = 'Today at Khanna Mandi, Sharbati Wheat is trading at ₹2,425 per quintal, up 2.4%. Mustard at Alwar APMC is ₹5,650 per quintal.';
    } else if (q.includes('pool') || q.includes('mandi') || q.includes('truck') || q.includes('freight') || q.includes('ट्रांसपोर्ट')) {
      reply = 'Navigating to Mandi Freight Transport Pooling. You can join shared trolleys and save up to 45% on diesel.';
      navigate('/mandi');
    } else if (q.includes('map') || q.includes('gps') || q.includes('radar') || q.includes('नक्शा')) {
      reply = 'Opening live GPS radar map to view active tractors and freight trucks in nearby villages.';
      navigate('/map');
    } else if (q.includes('pay') || q.includes('upi') || q.includes('escrow') || q.includes('रुपये') || q.includes('भुगतान')) {
      reply = 'Opening digital escrow and instant UPI payment counter.';
      navigate('/payment');
    } else if (q.includes('help') || q.includes('kisan') || q.includes('मदद')) {
      reply = 'Opening Kisan Help Desk and agricultural advisory portal.';
      navigate('/help');
    } else {
      reply = `I heard: "${rawText}". You can ask me to book tractors, check mandi prices, join freight pools, or open live GPS radar.`;
    }

    setAiResponse(reply);
    speak(reply);
  };

  useEffect(() => {
    handleCommandRef.current = handleVoiceCommand;
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = BCP47_MAP[currentLang] || 'hi-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
        if (event.results[current].isFinal && handleCommandRef.current) {
          handleCommandRef.current(text);
        }
      };
      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    setTranscript('');
    setAiResponse('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // no-op
      }
    }
  };

  const openWhatsAppHelp = () => {
    const msg = encodeURIComponent('Namaste KrishiPool! I need assistance with equipment booking, mandi freight pooling, and farmer support.');
    window.open(`https://wa.me/919800000001?text=${msg}`, '_blank');
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <motion.button
          onClick={openWhatsAppHelp}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Direct WhatsApp Farmer Support"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 transition-all border-2 border-white/40"
        >
          <MessageSquare size={22} />
        </motion.button>

        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 text-white shadow-xl hover:shadow-emerald-600/30 transition-all border-2 border-emerald-400/50"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-100"></span>
          </span>
          <Bot size={18} />
          <span className="text-xs font-bold tracking-wide">Kisan Voice AI</span>
        </motion.button>
      </div>

      {/* Voice Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden"
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-1.5">
                      Kisan Voice AI & Assistant
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">Bilingual</span>
                    </h3>
                    <p className="text-xs text-slate-500">Ask in English or Hindi (बोलकर ट्रैक्टर खोजें या मंडी भाव जानें)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:scale-105"
                      title="Mute voice"
                    >
                      <VolumeX size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => { setIsOpen(false); stopSpeaking(); stopListening(); }}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Central Voice Circle */}
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <div className="relative mb-4">
                  {isListening && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
                      <div className="absolute -inset-3 rounded-full bg-teal-500/20 animate-pulse"></div>
                    </>
                  )}
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full text-white shadow-xl transition-transform active:scale-90 ${
                      isListening ? 'bg-rose-500 shadow-rose-500/40' : 'bg-emerald-600 shadow-emerald-600/40 hover:scale-105'
                    }`}
                  >
                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isListening ? 'Listening... Speak now (कृपया बोलें)' : 'Tap microphone to speak'}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Try saying: "Book tractor", "Check wheat price", or "Find mandi pooling"
                </p>
              </div>

              {/* Live Transcript / Response Box */}
              {(transcript || aiResponse) && (
                <div className="mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-slate-200 dark:border-slate-700 text-left space-y-2">
                  {transcript && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">You said:</span>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">"{transcript}"</p>
                    </div>
                  )}
                  {aiResponse && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <Sparkles size={10} /> KrishiPool Voice:
                      </span>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mt-0.5">{aiResponse}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 1-Tap Quick Actions */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Or click quick voice prompt:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_COMMANDS.map((cmd) => (
                    <button
                      key={cmd.text}
                      onClick={() => {
                        setTranscript(cmd.query);
                        handleVoiceCommand(cmd.query);
                      }}
                      className="flex items-center justify-between rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 p-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-300 dark:hover:border-emerald-700 text-left"
                    >
                      <span>{cmd.text}</span>
                      <ArrowRight size={12} className="opacity-60 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp Farmer Community Link */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <ShieldCheck size={14} className="text-emerald-500" /> Rural Voice Support
                </span>
                <button
                  onClick={openWhatsAppHelp}
                  className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <MessageSquare size={13} /> Chat on WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
