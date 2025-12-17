import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, Minimize2, Radio, Bot, Send, X, Volume2, MicOff, Activity, Zap } from 'lucide-react';
import { ChatMessage, UserStats } from '../types';
import { generateCompanionResponse } from '../services/geminiService';

interface ArenaCoreProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

// --- AUDIO UTILITIES ---
function floatTo16BitPCM(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const ArenaCore: React.FC<ArenaCoreProps> = ({ isOpen, onClose, stats }) => {
  // Mode State
  const [mode, setMode] = useState<'TEXT' | 'LIVE'>('TEXT');

  // Text Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live API State
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Live API Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null); // To hold the active session promise/object

  // --- TEXT CHAT LOGIC ---
  useEffect(() => {
    if (isOpen && messages.length === 0 && mode === 'TEXT') {
      setMessages([
        { 
          id: '1', 
          sender: 'ai', 
          text: `System Online. Neural Link Established. \n\nGreetings, Operator ${stats.rank}. Ready for tactical assistance.`, 
          timestamp: new Date() 
        }
      ]);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mode]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const context = messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');
    const responseText = await generateCompanionResponse(userMsg.text, context, stats);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: responseText,
      timestamp: new Date()
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMsg]);
  };

  // --- LIVE API LOGIC ---

  const startLiveSession = async () => {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        alert("API Key missing");
        return;
      }

      const client = new GoogleGenAI({ apiKey });
      
      // 1. Setup Audio Contexts
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext({ sampleRate: 24000 }); // Output rate
      audioContextRef.current = audioCtx;
      nextStartTimeRef.current = audioCtx.currentTime;

      // 2. Setup Input Stream (Microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
      mediaStreamRef.current = stream;

      // 3. Connect to Gemini Live
      const sessionPromise = client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are a futuristic AI companion for a student named ${stats.rank}. Keep responses short, punchy, and motivating. Use cybernetic/gaming slang.`
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
            setIsConnected(true);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const audioData = base64ToUint8Array(base64Audio);
              
              // Simple visualization hook (fake volume based on chunk size)
              setVolumeLevel(Math.min(100, audioData.length / 100));
              setTimeout(() => setVolumeLevel(0), 200);

              // Convert PCM Int16 -> Float32 for playback
              const int16 = new Int16Array(audioData.buffer);
              const float32 = new Float32Array(int16.length);
              for(let i=0; i<int16.length; i++) {
                float32[i] = int16[i] / 32768.0;
              }

              const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
              buffer.getChannelData(0).set(float32);

              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              
              const startTime = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
            }
          },
          onclose: () => {
            console.log("Gemini Live Closed");
            setIsConnected(false);
            stopLiveSession();
          },
          onerror: (err) => {
            console.error("Gemini Live Error", err);
            setIsConnected(false);
            stopLiveSession();
          }
        }
      });
      
      sessionRef.current = sessionPromise;

      // 4. Setup Audio Recorder (Input)
      // We need a separate context for input to ensure 16kHz if possible, or downsample
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (!isMicOn) return; // Mute logic
        
        const inputData = e.inputBuffer.getChannelData(0);
        // Visualizer for input
        const vol = inputData.reduce((acc, val) => acc + Math.abs(val), 0) / inputData.length;
        if (vol > 0.01) setVolumeLevel(Math.min(100, vol * 500));

        // Convert to 16-bit PCM
        const pcm16 = floatTo16BitPCM(inputData);
        const base64 = arrayBufferToBase64(pcm16.buffer);

        // Send to Gemini
        sessionPromise.then(session => {
             session.sendRealtimeInput({
                 media: {
                     mimeType: 'audio/pcm;rate=16000',
                     data: base64
                 }
             });
        });
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
      
      processorRef.current = processor;
      inputSourceRef.current = source;

    } catch (e) {
      console.error("Failed to start live session", e);
      alert("Could not connect to Neural Core (Live API).");
    }
  };

  const stopLiveSession = () => {
    setIsConnected(false);
    
    // Stop Tracks
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    
    // Disconnect Nodes
    processorRef.current?.disconnect();
    inputSourceRef.current?.disconnect();
    
    // Close Contexts
    audioContextRef.current?.close();

    // Reset Refs
    mediaStreamRef.current = null;
    processorRef.current = null;
    inputSourceRef.current = null;
    audioContextRef.current = null;
    nextStartTimeRef.current = 0;
  };

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
        stopLiveSession();
    }
    return () => {
        stopLiveSession();
    };
  }, [isOpen]);

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cyber-black/95 backdrop-blur-md md:absolute md:bottom-20 md:right-6 md:w-[400px] md:h-[650px] md:rounded-2xl md:inset-auto md:border md:border-cyber-neonBlue/50 md:shadow-[0_0_60px_rgba(0,243,255,0.15)] animate-in slide-in-from-bottom-10 fade-in duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-cyber-panel md:rounded-t-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-cyber-neonBlue/5 animate-pulse" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-full border border-cyber-neonBlue flex items-center justify-center bg-black">
            <Bot className="w-5 h-5 text-cyber-neonBlue" />
          </div>
          <div>
             <h2 className="font-bold text-white tracking-widest text-sm uppercase">NEURAL COMPANION</h2>
             <p className="text-[10px] text-cyber-neonBlue font-mono flex items-center gap-1">
               <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}/> 
               {isConnected ? 'LIVE UPLINK ACTIVE' : 'TEXT MODE'}
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
            {/* Mode Toggle */}
            <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                <button 
                    onClick={() => {
                        stopLiveSession();
                        setMode('TEXT');
                    }}
                    className={`p-1.5 rounded ${mode === 'TEXT' ? 'bg-cyber-neonBlue text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    <Send size={14} />
                </button>
                <button 
                    onClick={() => setMode('LIVE')}
                    className={`p-1.5 rounded ${mode === 'LIVE' ? 'bg-red-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    <Activity size={14} />
                </button>
            </div>
            
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
                <Minimize2 size={18} className="text-gray-400" />
            </button>
        </div>
      </div>

      {/* --- LIVE MODE UI --- */}
      {mode === 'LIVE' && (
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

             {!isConnected ? (
                 <div className="text-center z-10 space-y-6">
                     <div className="w-32 h-32 mx-auto rounded-full border-2 border-dashed border-red-500/50 flex items-center justify-center animate-spin-slow">
                        <Radio size={48} className="text-red-500" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Voice Uplink</h3>
                        <p className="text-gray-400 text-xs mt-2">Establish real-time neural connection.</p>
                     </div>
                     <button 
                        onClick={startLiveSession}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-transform hover:scale-105"
                     >
                        Connect
                     </button>
                 </div>
             ) : (
                 <div className="flex flex-col items-center justify-between h-full w-full py-12 z-10">
                     {/* Visualizer */}
                     <div className="relative w-48 h-48 flex items-center justify-center">
                         <div 
                            className="absolute inset-0 bg-red-500/20 rounded-full blur-xl transition-all duration-100"
                            style={{ transform: `scale(${1 + volumeLevel/50})` }}
                         />
                         <div 
                            className="w-32 h-32 border-4 border-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-75"
                            style={{ transform: `scale(${1 + volumeLevel/100})` }}
                         >
                            <Mic size={48} className={`text-white transition-opacity ${isMicOn ? 'opacity-100' : 'opacity-50'}`} />
                         </div>
                         
                         {/* Orbitals */}
                         <div className="absolute inset-[-20px] border border-red-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
                         <div className="absolute inset-[-40px] border border-red-500/20 rounded-full animate-[spin_8s_linear_infinite_reverse]" />
                     </div>

                     <div className="text-center space-y-2">
                        <div className="text-2xl font-mono font-bold text-red-500 tracking-widest animate-pulse">
                            {volumeLevel > 5 ? 'TRANSMITTING...' : 'LISTENING...'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                            LATENCY: 42ms // SECURE CHANNEL
                        </div>
                     </div>

                     {/* Controls */}
                     <div className="flex items-center gap-6">
                        <button 
                            onClick={toggleMic}
                            className={`p-4 rounded-full border transition-all ${isMicOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-900/20 border-red-500 text-red-500'}`}
                        >
                            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>
                        
                        <button 
                            onClick={stopLiveSession}
                            className="p-6 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-transform hover:scale-110"
                        >
                            <X size={32} />
                        </button>
                     </div>
                 </div>
             )}
          </div>
      )}

      {/* --- TEXT MODE UI --- */}
      {mode === 'TEXT' && (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`
                    max-w-[85%] p-3 rounded-xl text-sm border relative
                    ${msg.sender === 'user' 
                        ? 'bg-cyber-neonBlue/10 border-cyber-neonBlue/30 text-white rounded-br-none' 
                        : 'bg-gray-900 border-white/10 text-gray-200 rounded-bl-none shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                    }
                    `}>
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                    <div className="text-[9px] text-gray-600 font-mono mt-1 text-right">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    </div>
                </div>
                ))}
                {isTyping && (
                <div className="flex justify-start">
                    <div className="text-xs text-cyber-neonBlue font-mono animate-pulse flex items-center gap-2 bg-black/50 px-2 py-1 rounded">
                    <span className="w-1 h-1 bg-cyber-neonBlue rounded-full animate-bounce"/>
                    <span className="w-1 h-1 bg-cyber-neonBlue rounded-full animate-bounce delay-75"/>
                    <span className="w-1 h-1 bg-cyber-neonBlue rounded-full animate-bounce delay-150"/>
                    PROCESSING...
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-cyber-panel border-t border-white/10 md:rounded-b-2xl relative z-10">
                <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type directive..."
                    className="flex-1 bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-cyber-neonBlue outline-none placeholder:text-gray-600 font-mono text-sm"
                />
                <button 
                    onClick={handleSend}
                    className="p-2 bg-cyber-neonBlue/20 text-cyber-neonBlue rounded-lg border border-cyber-neonBlue/50 hover:bg-cyber-neonBlue/30 transition-colors"
                >
                    <Send size={20} />
                </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};