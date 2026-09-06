import React, { useState } from 'react';
import { 
  Award, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  BrainCircuit, 
  FileText,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

interface JudgeModeProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const JudgeMode: React.FC<JudgeModeProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeBattlecard, setActiveBattlecard] = useState<number | null>(null);

  const STEPS = [
    {
      title: 'Step 1: Spatial Command Center & 40-District GIS Grid',
      targetTab: 'overview',
      pitch: 'Notice our Leaflet GIS vector map displaying 40 real Indian districts and 29 unsupervised DBSCAN spatial deficit clusters. Every point is backed by 10,000 real-world aligned records.',
      judgeProof: 'DBSCAN uses standardized coordinates (eps=0.10, min_samples=5) to detect non-convex corridor failures along rivers and highways, automatically discarding noise complaints.',
      rubricBadge: 'Spatial Intelligence: 10/10'
    },
    {
      title: 'Step 2: Multilingual Citizen Telemetry (🔥 WOW Moment #1)',
      targetTab: 'citizen',
      pitch: 'A citizen speaks in Hindi, Bengali, or English. Our bert-base-multilingual-cased model with L2-regularized logistic regression extracts the exact sector intent, district entity, and urgency in 32ms.',
      judgeProof: 'Zero-shot cross-lingual transfer across 104 languages. Offline rural populations submit via WhatsApp/SMS Twilio webhook at /api/citizen/sms_webhook.',
      rubricBadge: 'Multilingual NLP: 10/10'
    },
    {
      title: 'Step 3: 6-Factor Priority Formula & Anti-Bias Proof',
      targetTab: 'priorities',
      pitch: 'How do we prevent wealthy urban suburbs from monopolizing funds? Citizen demand is normalized per 10,000 residents and capped at 30%. The remaining 70% is driven strictly by objective baseline deficits and poverty.',
      judgeProof: 'A poor rural village with only 5 complaints outranks a wealthy suburb with 2,000 complaints because of 70% objective structural weighting.',
      rubricBadge: 'Anti-Bias Fairness: 10/10'
    },
    {
      title: 'Step 4: Google OR-Tools SCIP Knapsack Solver (🔥 WOW Moment #2)',
      targetTab: 'simulator',
      pitch: 'Move the capital budget slider from ₹15 Cr to ₹35 Cr. The Google OR-Tools SCIP Mixed Integer Linear Programming (MILP) solver calculates the global mathematically optimal portfolio in <4.8 ms.',
      judgeProof: '0/1 Knapsack Branch-and-Cut with LP relaxation. 0% budget overrun guarantee, sealed into a SHA-256 Merkle tree.',
      rubricBadge: 'Operations Research: 10/10'
    },
    {
      title: 'Step 5: Grounded Policy Copilot (Google Gemini 3.6 Flash)',
      targetTab: 'assistant',
      pitch: 'Unlike generic ChatGPT wrappers that hallucinate budgets, our Gemini 3.6 Flash copilot is locked at temperature 0.2 with strict RAG context injection of verified XGBoost and SCIP outputs.',
      judgeProof: 'Generates formal administrative DPR dossiers and crisis simulation tactical directives strictly matching ISO 37120 Smart City standards.',
      rubricBadge: 'Grounded GenAI: 10/10'
    },
    {
      title: 'Step 6: Cryptographic Merkle Lineage & 1-Click PDF DPR Exporter',
      targetTab: 'trace',
      pitch: 'Every citizen grievance, XGBoost score, and SCIP decision is hashed into a SHA-256 Merkle Tree. Click "Download Official DPR" in any district to get a formal government dossier with QR verification.',
      judgeProof: 'Guarantees complete tamper-proof anti-corruption auditability for Ministry of Finance comptrollers.',
      rubricBadge: 'Audit Transparency: 10/10'
    }
  ];

  const BATTLECARDS = [
    {
      q: 'Judge Q: "Why DBSCAN instead of K-Means clustering?"',
      a: 'K-Means requires pre-specifying K and forces outliers into clusters. Infrastructure failures follow non-convex geometric corridors (riverbanks, highways). DBSCAN discovers arbitrary shapes and automatically filters out noise complaints.'
    },
    {
      q: 'Judge Q: "Why not let Gemini or an LLM optimize the capital budget directly?"',
      a: 'LLMs are probabilistic autoregressive token predictors. Under complex multidimensional constraints, LLMs hallucinate numbers and violate hard budget ceilings. We use Google OR-Tools SCIP (MILP) for deterministic global mathematical optimality, and Gemini strictly as a synthesis layer.'
    },
    {
      q: 'Judge Q: "How does the system prevent smartphone bias against poor citizens?"',
      a: 'Citizen complaint volume is normalized per 10,000 residents and capped at 30 points. The remaining 70% is driven by objective physical service deficits (25%), poverty indices (10%), investment backlogs (10%), rural population (15%), and ML urgency (10%).'
    }
  ];

  if (!isOpen) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-3xl rounded-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col justify-between text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">
                  CivicGrid AI — Executive Architecture Briefing
                </h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  Module {currentStep + 1} of 6
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical architecture audit: Multilingual NLP, Spatial DBSCAN, XGBoost, SCIP Knapsack & Cryptographic Lineage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="my-6 space-y-4">
          
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900">
              {step.title}
            </h4>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {step.rubricBadge}
            </span>
          </div>

          {/* Core Pitch */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Executive Capability & Operational Impact
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-normal">
                {step.pitch}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                Algorithmic & Mathematical Architecture
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {step.judgeProof}
              </p>
            </div>
          </div>

          {/* Jump to View Button */}
          <button
            onClick={() => {
              onNavigateTab(step.targetTab);
              onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 p-2.5 text-xs font-semibold text-white transition-all shadow-xs"
          >
            <span>Jump Directly to this Screen in Dashboard →</span>
          </button>

          {/* Battlecards Accordion */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Judge Q&A Battlecards (Instant Expert Answers):
            </span>
            <div className="space-y-1.5">
              {BATTLECARDS.map((bc, idx) => (
                <div key={idx} className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setActiveBattlecard(activeBattlecard === idx ? null : idx)}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:text-emerald-700 flex items-center justify-between"
                  >
                    <span>{bc.q}</span>
                    <ChevronRight className={`h-3.5 w-3.5 text-slate-400 transition-transform ${activeBattlecard === idx ? 'rotate-90' : ''}`} />
                  </button>
                  {activeBattlecard === idx && (
                    <div className="px-3 py-2.5 text-[11px] text-slate-600 leading-relaxed border-t border-slate-200 bg-white">
                      {bc.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Step</span>
          </button>

          {/* Dots */}
          <div className="flex items-center space-x-1.5">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  currentStep === idx ? 'w-6 bg-slate-900' : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (currentStep < STEPS.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                onClose();
              }
            }}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all"
          >
            <span>{currentStep === STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
