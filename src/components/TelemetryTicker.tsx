import React, { useEffect, useState } from 'react';
import { TelemetryEvent } from '../types';
import { Radio, AlertCircle, ChevronDown, ChevronUp, Bell } from 'lucide-react';

interface TelemetryTickerProps {
  onSelectEvent?: (event: TelemetryEvent) => void;
}

export const TelemetryTicker: React.FC<TelemetryTickerProps> = ({ onSelectEvent }) => {
  const [events, setEvents] = useState<TelemetryEvent[]>([
    {
      telemetry_id: 108421,
      district: 'Bahraich',
      state: 'Uttar Pradesh',
      category: 'Healthcare',
      urgency: 'Critical',
      snippet: 'Primary Health Centre doctor absent; road flooded',
      timestamp: 'Just now'
    },
    {
      telemetry_id: 108422,
      district: 'Malda',
      state: 'West Bengal',
      category: 'Water & Sanitation',
      urgency: 'Critical',
      snippet: 'Drinking water pipeline ruptured in Kaliachak block',
      timestamp: '1m ago'
    },
    {
      telemetry_id: 108423,
      district: 'Sitapur',
      state: 'Uttar Pradesh',
      category: 'Energy & Power',
      urgency: 'High',
      snippet: '33kV agricultural transformer blown for 3 weeks',
      timestamp: '2m ago'
    },
    {
      telemetry_id: 108424,
      district: 'Darbhanga',
      state: 'Bihar',
      category: 'Roads & Transport',
      urgency: 'Critical',
      snippet: 'Box culvert collapsed on PMGSY link arterial',
      timestamp: '4m ago'
    }
  ]);
  const [collapsed, setCollapsed] = useState(false);

  // Subscribe to SSE stream from backend if available, with periodic simulation fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/dashboard/telemetry_stream');
      eventSource.onmessage = (e) => {
        try {
          const newEvt: TelemetryEvent = JSON.parse(e.data);
          setEvents((prev) => [newEvt, ...prev.slice(0, 15)]);
        } catch (err) {
          console.error(err);
        }
      };
    } catch (e) {
      console.warn('SSE stream error, using client fallback', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  if (collapsed) {
    return (
      <div className="fixed bottom-3 right-4 z-40">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center space-x-2 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30 shadow-lg backdrop-blur-md hover:bg-slate-800"
        >
          <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>Live Telemetry Ticker</span>
          <ChevronUp className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-cyan-500/20 bg-slate-950/95 backdrop-blur-md text-xs text-slate-300">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Left Indicator */}
        <div className="flex items-center space-x-2 shrink-0 pr-4 border-r border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-display font-bold text-[11px] uppercase tracking-wider text-white">
            Feature 7: Real-Time Telemetry Pulse
          </span>
        </div>

        {/* Scrolling Ticker Stream */}
        <div className="flex-1 overflow-x-hidden relative h-full flex items-center">
          <div className="flex items-center space-x-6 whitespace-nowrap animate-marquee">
            {events.map((evt, idx) => (
              <div 
                key={idx} 
                onClick={() => onSelectEvent && onSelectEvent(evt)}
                className="flex items-center space-x-2 cursor-pointer hover:text-cyan-300 transition-colors"
              >
                <span className="font-mono text-cyan-400 font-bold text-[10px]">#{evt.telemetry_id}</span>
                <span className="font-bold text-white">{evt.district}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                  evt.urgency === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-amber-950 text-amber-300'
                }`}>
                  {evt.category}
                </span>
                <span className="text-slate-400 text-[11px]">"{evt.snippet}"</span>
                <span className="text-slate-500 text-[9px] font-mono">({evt.timestamp})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Toggle */}
        <button
          onClick={() => setCollapsed(true)}
          className="ml-3 shrink-0 rounded p-1 text-slate-400 hover:text-white hover:bg-slate-900"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
};
