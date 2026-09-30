import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Globe2,
  FileCheck2,
  Layers,
  Award,
  Eye,
  Lock,
  X,
  Building2,
  BadgeCheck,
  Cpu
} from 'lucide-react';

interface InternationalStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InternationalStandardsModal: React.FC<InternationalStandardsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const standards = [
    {
      code: 'ISO/IEC 23988:2007',
      title: 'Delivery of Computer-Based Assessments',
      body: 'International standard for the security, fairness, item bank calibration, proctoring reliability, and technical resilience of high-stakes electronic examinations.',
      points: [
        'Secure item delivery with zero client-side answer key exposure',
        'Equal percentage subject weighting across 100 balanced items',
        'Automatic timestamping and resilient offline session persistence',
        'Deterministic zero-duplicate algorithmic question cycle rotation'
      ]
    },
    {
      code: 'ISO 9001:2015',
      title: 'Quality Management in Public Administration',
      body: 'Standardized management framework ensuring institutional consistency, transparent promotion criteria, and meritocratic civil service evaluation.',
      points: [
        'Structured 4-tier difficulty hierarchy corresponding to GL 03–17',
        'Uniform 70% qualification benchmark across all 23 FCTA cadres',
        'Audit-ready candidate attempt logging with immutable timestamps',
        'Comprehensive feedback referencing statutory citations (PSR, FR, PPA)'
      ]
    },
    {
      code: 'WCAG 2.1 AAA & ADA',
      title: 'Digital Accessibility & Inclusion Guidelines',
      body: 'Universal design ensuring full accessibility for candidates of all abilities, optical preferences, and physical accommodations.',
      points: [
        'Multi-theme display: Dark Gov-Tech, High Contrast (Yellow/Black), Light Paper, and Sepia',
        'Integrated Text-to-Speech (TTS) auditory question narration',
        'Adjustable typography scale (A-, A, A+) with enhanced letter spacing',
        'Keyboard navigable palette, clear touch targets, and option elimination tools'
      ]
    },
    {
      code: 'African Union & Commonwealth',
      title: 'Public Service Governance Charters',
      body: 'Adherence to the African Union Charter on Values and Principles of Public Service and Commonwealth Civil Service Principles.',
      points: [
        'Depoliticized, merit-based career progression testing',
        'Equal accessibility for all six FCT Area Councils (AMAC, Bwari, Gwagwalada, etc.)',
        'Protection of candidate privacy and strict role-based access control (ABAC)',
        'Standardized evaluation of financial integrity and procurement ethics'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 sm:p-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Global Public Sector Benchmarks
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  ISO Compliant
                </span>
              </div>
              <h3 className="text-xl font-black text-white">
                International Assessment & Civil Service Standards
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6">
          <p className="text-xs text-slate-300 leading-relaxed">
            The <strong>FCTA Staff CBT Examination Engine</strong> is architected to exceed international standards for high-stakes government examinations. From question psychometrics to zero-duplicate progression and WCAG accessibility, every component reflects best practices from global civil service commissions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standards.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      {s.code}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{s.body}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1">
                  {s.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Trust Footer Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-slate-400 shrink-0" />
              <div>
                <strong className="text-white">Federal Capital Territory Administration (FCTA)</strong>
                <p className="text-[11px] text-slate-400">
                  Department of Human Resource Management • Examinations & Staff Records Unit
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
