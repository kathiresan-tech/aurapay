import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Send,
  Sparkles,
  Volume2,
  ShieldCheck,
  ArrowUpRight,
  HelpCircle,
  Users,
  Store,
  UserPlus,
  ShieldAlert
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface HomeScreenProps {
  onSubmitPrompt: (promptText: string) => void;
  onOpenDirectory: () => void;
  onOpenScamGuide: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSubmitPrompt,
  onOpenDirectory,
  onOpenScamGuide,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [listeningFeedback, setListeningFeedback] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const [greeting, setGreeting] = useState('Good afternoon, Alex');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning, Alex');
    else if (hour < 17) setGreeting('Good afternoon, Alex');
    else setGreeting('Good evening, Alex');

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setListeningFeedback('Listening... speak now');
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join('');
          setPrompt(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setListeningFeedback(null);
        };

        recognition.onend = () => {
          setIsListening(false);
          setListeningFeedback(null);
        };

        recognitionRef.current = recognition;
      } catch {
        setSpeechSupported(false);
      }
    }
  }, []);

  const handleToggleVoice = () => {
    sound.playTap();
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setListeningFeedback(null);
    } else {
      if (speechSupported && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = (sample?: string) => {
    const chosen = sample || 'Pay to my friends';
    setIsListening(true);
    setListeningFeedback(`Simulating voice: “${chosen}”...`);
    setTimeout(() => {
      setPrompt(chosen);
      setIsListening(false);
      setListeningFeedback(null);
      sound.playTap();
    }, 1200);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    sound.playTap();
    onSubmitPrompt(prompt.trim());
  };

  const handleSuggestionClick = (suggestedText: string) => {
    sound.playTap();
    setPrompt(suggestedText);
    onSubmitPrompt(suggestedText);
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-5 pt-7 pb-6 bg-slate-900 text-white select-none overflow-y-auto">
      {/* Top Greeting Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-950 border border-sky-600/70 text-xs font-semibold text-sky-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Simulated Safe Sandbox
          </div>

          <button
            onClick={onOpenScamGuide}
            className="flex items-center gap-1.5 text-xs text-sky-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg border border-slate-700 transition cursor-pointer font-medium"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Safety Guide</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white pt-1">
          {greeting}
        </h1>
        <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-sm">
          What payment would you like to take care of today?
        </p>
      </div>

      {/* Center: ONE Large Prompt Box */}
      <div className="my-auto py-5 space-y-4">
        <form onSubmit={handleSubmit} className="relative">
          <div
            className={`group relative rounded-2xl bg-slate-800 border-2 transition-all duration-300 p-4 shadow-xl ${
              isListening
                ? 'border-sky-400 ring-4 ring-sky-500/30'
                : 'border-slate-600 hover:border-sky-400 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-500/20'
            }`}
          >
            {/* Top Prompt Header */}
            <div className="flex items-center justify-between text-xs text-slate-200 pb-2 mb-2 border-b border-slate-700">
              <span className="flex items-center gap-1.5 font-bold text-sky-300">
                <Sparkles className="w-4 h-4 text-sky-400" />
                AI Payment Assistant
              </span>
              <span className="text-xs text-slate-300 font-medium">Type or speak</span>
            </div>

            {/* Large Text Area */}
            <textarea
              ref={textareaRef}
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="e.g. “Pay to my friends”, “Pay to merchant”, or “Pay my electricity bill”..."
              className="w-full bg-slate-900/60 text-white placeholder-slate-400 text-sm sm:text-base font-normal leading-relaxed resize-none focus:outline-none p-2.5 rounded-xl border border-slate-700/60"
            />

            {/* Listening Wave indicator */}
            {isListening && (
              <div className="flex items-center gap-2 py-2 text-xs text-sky-300 font-medium">
                <div className="flex items-center gap-1 h-5">
                  <span className="w-1 bg-sky-400 rounded-full animate-wave-1"></span>
                  <span className="w-1 bg-sky-400 rounded-full animate-wave-2"></span>
                  <span className="w-1 bg-sky-400 rounded-full animate-wave-3"></span>
                  <span className="w-1 bg-sky-400 rounded-full animate-wave-4"></span>
                </div>
                <span className="animate-pulse">{listeningFeedback || 'Listening...'}</span>
              </div>
            )}

            {/* Bottom Actions Bar inside prompt box */}
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  title={isListening ? 'Stop recording' : 'Speak your request'}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
                    isListening
                      ? 'bg-rose-600 text-white border border-rose-400'
                      : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500'
                  }`}
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-white' : 'text-sky-300'}`} />
                  <span>{isListening ? 'Stop' : 'Speak'}</span>
                </button>

                {/* Quick voice simulation tester */}
                <button
                  type="button"
                  onClick={() => simulateVoiceInput('Pay to my friends')}
                  title="Simulate speaking “Pay to my friends”"
                  className="hidden sm:flex items-center gap-1.5 text-xs text-sky-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-2.5 py-2 rounded-xl border border-slate-700 transition cursor-pointer font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Demo Voice</span>
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!prompt.trim()}
                className={`flex items-center justify-center p-3 rounded-xl transition duration-200 cursor-pointer ${
                  prompt.trim()
                    ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/40 font-bold'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Suggested Quick Conversational Chips */}
        <div className="space-y-2 pt-1">
          <p className="text-xs text-sky-300 uppercase tracking-wider font-bold px-1">
            Tap a quick request
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSuggestionClick('Pay to my friends')}
              className="text-left bg-slate-800 hover:bg-slate-750 text-white border-2 border-sky-600/70 hover:border-sky-400 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 group shadow-sm"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>“Pay to my friends” (Contact List)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400 transition" />
            </button>

            <button
              onClick={() => handleSuggestionClick('Pay to merchant')}
              className="text-left bg-slate-800 hover:bg-slate-750 text-white border-2 border-emerald-600/70 hover:border-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 group shadow-sm"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>“Pay to merchant” (Store Verification)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 transition" />
            </button>

            <button
              onClick={() => handleSuggestionClick('Pay new user')}
              className="text-left bg-slate-800 hover:bg-slate-750 text-white border-2 border-slate-600 hover:border-sky-400 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 group shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>“Pay new user” (Name Match Check)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400 transition" />
            </button>

            <button
              onClick={() => handleSuggestionClick('Pay ₹15,000 to Priya Verma')}
              className="text-left bg-indigo-950/80 hover:bg-indigo-900 text-indigo-100 border-2 border-indigo-500 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 group shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span>“Send ₹15,000” (Test &gt;₹10k 2-Step Auth)</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400 transition" />
            </button>

            <button
              onClick={() => handleSuggestionClick('Pay my electricity bill')}
              className="text-left bg-slate-800 hover:bg-slate-750 text-white border-2 border-slate-600 hover:border-sky-400 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 group shadow-sm"
            >
              <span>⚡ “Pay electricity bill”</span>
              <ArrowUpRight className="w-3 h-3 text-sky-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Trust & Verification Note */}
      <div className="pt-3 border-t border-slate-700 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span className="text-white">Demo biller & payment directory</span>
          </div>
          <button
            onClick={onOpenDirectory}
            className="text-xs text-sky-300 hover:text-white font-bold underline cursor-pointer"
          >
            Browse sample billers
          </button>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          Friend and merchant profiles use sample data only. Payments above ₹10,000 show the demo 2-step verification flow.
        </p>
      </div>
    </div>
  );
};

