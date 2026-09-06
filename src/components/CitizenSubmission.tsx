import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Globe2,
  RefreshCw,
  Layers
} from 'lucide-react';
import { submitCitizenGrievance, fetchRecentTelemetry } from '../lib/api';
import confetti from 'canvas-confetti';

interface CitizenSubmissionProps {
  onTelemetrySubmitted?: (telemetry: any) => void;
}

export const CitizenSubmission: React.FC<CitizenSubmissionProps> = ({ onTelemetrySubmitted }) => {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [recentList, setRecentList] = useState<any[]>([]);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Web Speech Recognition reference
  const recognitionRef = useRef<any>(null);

  // Word-for-Word Presets from Part I of Master Manual
  const PRESET_SCRIPTS = [
    {
      lang: 'Hindi (हिंदी)',
      id: 'Hindi',
      label: 'Preset 1: UP Healthcare & Monsoon Flooding',
      district: 'Bahraich',
      sector: 'Healthcare',
      text: 'हमारे बहराइच जिले में प्राथमिक स्वास्थ्य केंद्र में डॉक्टर नहीं हैं और सड़क टूटी होने से बारिश में अस्पताल तक पहुंचना नामुमकिन हो गया है।'
    },
    {
      lang: 'Bengali (বাংলা)',
      id: 'Bengali',
      label: 'Preset 2: North Bengal Drinking Water Rupture',
      district: 'Malda',
      sector: 'Water & Sanitation',
      text: 'আমাদের মালদা এবং কাটিহার অঞ্চলে পানীয় জলের পাইপলাইন ফেটে গেছে, মানুষ নোংরা জল খেতে বাধ্য হচ্ছে।'
    },
    {
      lang: 'English',
      id: 'English',
      label: 'Preset 3: Sitapur Agricultural Transformer Failure',
      district: 'Sitapur',
      sector: 'Energy & Power',
      text: 'In Sitapur district, the main agricultural power transformer has been blown for three weeks, completely halting rural irrigation.'
    },
    {
      lang: 'Portuguese',
      id: 'Portuguese',
      label: 'Preset 4: Rural Health Clinic & Collapsed Bridge',
      district: 'Darbhanga',
      sector: 'Healthcare / Roads',
      text: 'O posto de saúde comunitário está sem médicos e a ponte de concreto desabou, deixando a comunidade ilhada.'
    }
  ];

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    try {
      const data = await fetchRecentTelemetry();
      if (data && data.telemetry) {
        setRecentList(data.telemetry);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_SCRIPTS[0]) => {
    setInputText(preset.text);
    setSelectedLanguage(preset.id);
    setAnalysisResult(null);
  };

  // Toggle Live Speech Recognition
  const toggleSpeech = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please use Chrome or click a preset.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    if (selectedLanguage === 'Hindi') recognition.lang = 'hi-IN';
    else if (selectedLanguage === 'Bengali') recognition.lang = 'bn-IN';
    else if (selectedLanguage === 'Portuguese') recognition.lang = 'pt-BR';
    else recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInputText(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await submitCitizenGrievance(inputText);
      if (res && res.analysis) {
        setAnalysisResult(res.analysis);
        setSubmissionSuccess(true);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
        loadRecent();
        if (onTelemetrySubmitted) {
          onTelemetrySubmitted(res.analysis);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Globe2 className="h-5 w-5 text-cyan-400" />
              <h2 className="font-display text-xl font-bold text-white">
                Multilingual Citizen Telemetry Ingestion Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Zero-Shot BERT NLP classification supporting Hindi, Bengali, English, Marathi, and Portuguese with automatic DBSCAN clustering
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-cyan-950/80 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
              bert-base-multilingual-cased (L2 Regularized)
            </span>
          </div>
        </div>

        {/* Live Stage Spoken Preset Scripts */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Live Demo Word-for-Word Voice Presets (Click to Test):
          </span>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {PRESET_SCRIPTS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleSelectPreset(preset)}
                className="flex flex-col justify-between rounded-xl bg-slate-900/80 p-3 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-all group"
              >
                <div>
                  <div className="text-[11px] font-bold text-cyan-400">{preset.lang}</div>
                  <div className="text-xs font-medium text-slate-200 mt-0.5">{preset.label}</div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 line-clamp-1 italic">
                  "{preset.text}"
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column: Voice / Text Input Box (7 Cols) */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <span>Citizen Audio Transcript / Grievance Text</span>
            </label>
            
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-slate-200 border border-slate-700 focus:outline-none"
              >
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="English">English</option>
                <option value="Portuguese">Portuguese (Português)</option>
              </select>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Speak or paste citizen grievance in any language (e.g. Hindi, Bengali, English)..."
              className="w-full rounded-xl bg-slate-950/80 p-4 text-sm text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-sans"
            />
            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center space-x-2 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/40 text-rose-300 text-xs animate-pulse">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span>Listening Live...</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
              {/* Web Speech Microphone Button */}
              <button
                type="button"
                onClick={toggleSpeech}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
                    : 'bg-slate-900 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-950/50'
                }`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span>{isRecording ? 'Stop Recording' : 'Live Voice Input'}</span>
              </button>

              {/* Animated Waveform when recording */}
              {isRecording && (
                <div className="flex items-center space-x-1 h-8 px-2">
                  <div className="w-1 bg-rose-500 rounded-full wave-bar" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 bg-rose-400 rounded-full wave-bar" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 bg-cyan-400 rounded-full wave-bar" style={{ animationDelay: '0.3s' }} />
                  <div className="w-1 bg-rose-400 rounded-full wave-bar" style={{ animationDelay: '0.15s' }} />
                  <div className="w-1 bg-cyan-500 rounded-full wave-bar" style={{ animationDelay: '0.25s' }} />
                </div>
              )}
            </div>

            {/* Analyze & Ingest Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:scale-102 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>BERT Inferencing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze & Ingest Telemetry</span>
                </>
              )}
            </button>
          </div>

          {/* Feature 2 Callout: Offline WhatsApp & SMS */}
          <div className="rounded-xl bg-slate-900/70 p-3.5 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <span><b>Feature 2 Active</b>: Rural WhatsApp & Twilio SMS Bot endpoint active at <code className="text-cyan-400 font-mono">/api/citizen/sms_webhook</code></span>
            </div>
            <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30 font-mono">
              200 OK
            </span>
          </div>
        </div>

        {/* Right Column: Real-Time BERT Extraction Card (5 Cols) */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                BERT Semantic Extraction Card
              </span>
              <span className="font-mono text-[11px] text-cyan-400">
                {analysisResult ? `ID #${analysisResult.telemetry_id}` : 'Awaiting Input'}
              </span>
            </div>

            {analysisResult ? (
              <div className="mt-4 space-y-3.5">
                {/* Sector Intent */}
                <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Identified Infrastructure Sector</div>
                  <div className="text-base font-extrabold text-cyan-400 mt-0.5">{analysisResult.intent_name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Model Confidence: <b>{(analysisResult.confidence * 100).toFixed(1)}%</b></span>
                    <span>Language: <b className="text-slate-200">{analysisResult.detected_language}</b></span>
                  </div>
                </div>

                {/* Spatial Entity & Urgency */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Extracted District</div>
                    <div className="text-sm font-bold text-white mt-0.5">{analysisResult.extracted_district}</div>
                  </div>
                  <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Urgency Rating</div>
                    <div className={`text-sm font-bold mt-0.5 ${
                      analysisResult.urgency_rating === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {analysisResult.urgency_rating}
                    </div>
                  </div>
                </div>

                {/* Distress Signals */}
                <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Detected Distress Keywords</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {analysisResult.distress_signals && analysisResult.distress_signals.length > 0 ? (
                      analysisResult.distress_signals.map((sig: string, idx: number) => (
                        <span key={idx} className="rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
                          {sig}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400">Structural degradation indicators logged</span>
                    )}
                  </div>
                </div>

                {/* Standardized English Summary */}
                <div className="text-xs text-slate-300 italic bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/20">
                  "{analysisResult.standardized_english_summary}"
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Mic className="h-10 w-10 mx-auto text-slate-600 mb-2 opacity-60" />
                <p className="text-xs">Click a preset above or tap "Live Voice Input" to run real-time BERT inference.</p>
              </div>
            )}
          </div>

          {/* Status footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>DBSCAN Mesh Ingestion Ready</span>
            </span>
            <span className="font-mono text-cyan-400">Latency: 32ms</span>
          </div>
        </div>

      </div>

      {/* Recent Telemetry Stream Table */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <span>Recent Telemetry Dispatches across 40 Districts</span>
          </h3>
          <span className="text-xs text-slate-400">Auto-refreshing via National Mesh</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-2.5">ID #</th>
                <th className="px-4 py-2.5">Language</th>
                <th className="px-4 py-2.5">District / Region</th>
                <th className="px-4 py-2.5">Deficit Category</th>
                <th className="px-4 py-2.5">Urgency</th>
                <th className="px-4 py-2.5">Citizen Snippet</th>
                <th className="px-4 py-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {recentList.slice(0, 5).map((item) => (
                <tr key={item.telemetry_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-cyan-400">#{item.telemetry_id}</td>
                  <td className="px-4 py-2.5">{item.language}</td>
                  <td className="px-4 py-2.5 font-semibold text-white">{item.district}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`font-bold ${
                      item.urgency === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {item.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 max-w-xs truncate">{item.snippet}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-[10px]">{item.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
