import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, RefreshCcw, Sparkles } from 'lucide-react';
import { generateJokeText, generateSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';
import { JokeDisplay } from './components/JokeDisplay';
import { Rating } from './components/Rating';

const SAMPLE_RATE = 24000;

export default function App() {
  const [joke, setJoke] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  
  // Audio context references
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
      });
    }
  };

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {
        // Ignore error if already stopped
      }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(async () => {
    initAudioContext();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Resume context if suspended (browser policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (isPlaying) {
      stopAudio();
      return;
    }

    // If we already have the buffer, just play it
    if (audioBufferRef.current) {
      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      sourceRef.current = source;
      source.start();
      setIsPlaying(true);
      return;
    }

    // Otherwise, fetch and decode
    if (!joke) return;
    
    setAudioLoading(true);
    const base64Audio = await generateSpeech(joke);
    
    if (base64Audio) {
      try {
        const audioBytes = decode(base64Audio);
        const buffer = await decodeAudioData(audioBytes, ctx, SAMPLE_RATE, 1);
        audioBufferRef.current = buffer;

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        sourceRef.current = source;
        source.start();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
    setAudioLoading(false);
  }, [joke, isPlaying, stopAudio]);

  const fetchNewJoke = useCallback(async () => {
    stopAudio();
    setLoading(true);
    setRating(0);
    audioBufferRef.current = null; // Clear cached audio
    
    const newJoke = await generateJokeText();
    setJoke(newJoke);
    setLoading(false);
  }, [stopAudio]);

  useEffect(() => {
    fetchNewJoke();
    // Cleanup audio on unmount
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 p-4 flex flex-col items-center">
      <header className="w-full max-w-2xl flex items-center justify-center py-6 mb-4">
        <Sparkles className="text-yellow-400 mr-2 animate-bounce" size={32} />
        <h1 className="text-4xl md:text-5xl font-cute text-pink-600 drop-shadow-md tracking-wider">
          开心笑话屋
        </h1>
        <Sparkles className="text-yellow-400 ml-2 animate-bounce" size={32} />
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-8">
        {/* Joke Card */}
        <section className="relative">
          <div className="absolute -top-6 -left-4 w-12 h-12 bg-yellow-300 rounded-full opacity-50 blur-xl animate-pulse"></div>
          <div className="absolute -bottom-6 -right-4 w-16 h-16 bg-pink-300 rounded-full opacity-50 blur-xl animate-pulse delay-100"></div>
          
          <JokeDisplay text={joke} loading={loading} />
        </section>

        {/* Controls */}
        <section className="flex flex-col items-center gap-6">
            
            {/* Audio Control */}
            <div className="flex gap-4">
               <button 
                  onClick={playAudio}
                  disabled={loading || audioLoading}
                  className={`
                    relative group flex items-center justify-center gap-2 px-8 py-3 rounded-full text-xl font-cute shadow-lg transition-all
                    ${loading || audioLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-purple-600 hover:bg-purple-50 hover:scale-105 hover:shadow-xl active:scale-95'}
                  `}
               >
                 {audioLoading ? (
                    <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                 ) : isPlaying ? (
                    <VolumeX size={28} />
                 ) : (
                    <Volume2 size={28} />
                 )}
                 <span>{audioLoading ? "准备中..." : isPlaying ? "停止播放" : "听笑话"}</span>
               </button>

               <button
                onClick={fetchNewJoke}
                disabled={loading}
                className={`
                  flex items-center justify-center gap-2 px-8 py-3 rounded-full text-xl font-cute shadow-lg transition-all
                  ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600 hover:scale-105 hover:shadow-xl active:scale-95'}
                `}
               >
                 <RefreshCcw size={24} className={loading ? "animate-spin" : ""} />
                 <span>下一个</span>
               </button>
            </div>

            {/* Rating Section */}
            {!loading && (
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl w-full shadow-sm animate-fade-in-up">
                 <Rating rating={rating} onRate={setRating} disabled={loading} />
              </div>
            )}

        </section>
      </main>
      
      <footer className="mt-auto py-6 text-center text-gray-500 text-sm">
        <p>© 2024 开心笑话屋 • 为快乐而生</p>
      </footer>
    </div>
  );
}