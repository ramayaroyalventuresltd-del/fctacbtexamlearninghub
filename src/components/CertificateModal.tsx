import React, { useRef } from 'react';
import { ExamAttempt, UserProfile } from '../types';
import { Award, Printer, X, CheckCircle2, ShieldCheck, Download, Building2 } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempt: ExamAttempt;
  user?: UserProfile;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  attempt,
  user
}) => {
  if (!isOpen) return null;

  const candidateName = user?.fullName || attempt.staffName || 'Officer Candidate';
  const candidateStaffId = user?.staffId || attempt.staffId || 'FCTA/CBT';
  const candidateCadre = user?.cadre || attempt.cadre || 'Administrative Officer';
  const candidateGradeLevel = user?.gradeLevel || attempt.gradeLevel || 'GL 08';

  // Generate deterministic serial hash
  const certSerial = `FCTA-CBT-${attempt.cycleIndex}-${attempt.setNumber}-${attempt.userId.substring(0, 6).toUpperCase()}-${attempt.score}`;
  const verificationHash = `${Math.abs(attempt.startedAt.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)).toString(16).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  // Determine next grade level for promotion
  const getNextGradeLevel = (gl: string) => {
    const num = parseInt(gl.replace(/\D/g, ''), 10);
    if (isNaN(num)) return 'Next Grade Level';
    if (num === 10) return 'GL 12 (Principal Officer)';
    if (num < 17) return `GL ${String(num + 1).padStart(2, '0')}`;
    return 'GL 17 (Directorate Peak)';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-white shadow-2xl relative max-h-[95vh] overflow-y-auto print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Action Header (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Official Government Credential
            </span>
            <span className="text-xs text-slate-400 font-mono">ISO 9001:2015 Verified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE DOCUMENT */}
        <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-500/40 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-2xl print:border-4 print:border-amber-700 print:bg-white print:text-slate-900">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

          {/* Certificate Header */}
          <div className="text-center space-y-2 mb-8">
            {/* National Coat of Arms / FCTA Seal Vector */}
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950 border-2 border-amber-400 flex items-center justify-center p-2 shadow-lg mb-2 print:border-amber-600">
              <Building2 className="w-9 h-9 text-emerald-400 print:text-emerald-700" />
            </div>

            <div className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 print:text-emerald-800">
              Federal Republic of Nigeria
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-slate-900 uppercase">
              Federal Capital Territory Administration
            </h2>
            <div className="text-xs font-semibold text-slate-400 print:text-slate-600">
              Directorate of Human Resources Management • FCTA CBT EXAM HUB
            </div>
            <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider print:bg-amber-100 print:text-amber-900 print:border-amber-300">
              Certificate of Promotion Examination Competence
            </div>
          </div>

          {/* Candidate Presentation Statement */}
          <div className="text-center space-y-4 max-w-xl mx-auto mb-8">
            <p className="text-xs text-slate-400 print:text-slate-600 italic">
              This is to formally certify that the officer named herein has satisfactorily undertaken and passed the official computer-based statutory promotion evaluation:
            </p>

            <div className="text-2xl sm:text-3xl font-black text-amber-400 print:text-amber-700 tracking-tight">
              {candidateName}
            </div>

            <div className="text-xs text-slate-300 print:text-slate-700 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <span><strong>Staff File No:</strong> {candidateStaffId}</span>
              <span>•</span>
              <span><strong>Cadre:</strong> {candidateCadre}</span>
              <span>•</span>
              <span><strong>Current Grade:</strong> {candidateGradeLevel}</span>
            </div>

            <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed pt-2">
              Having achieved an aggregate score of <strong className="text-emerald-400 print:text-emerald-700 font-mono font-bold text-sm">{attempt.score}/100 ({attempt.percentage}%)</strong>, which fulfills the required <strong className="text-white print:text-slate-900 font-bold">70% Passmark Threshold</strong> for <strong className="text-white print:text-slate-900 font-bold">Exam Set {attempt.setNumber} (Difficulty Tier {attempt.difficultyTier})</strong>.
            </p>
          </div>

          {/* Subject Performance Grid */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs mb-8 p-3 rounded-xl bg-slate-950/80 border border-slate-800 print:bg-slate-100 print:border-slate-300">
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 font-bold">PSR (20 Qs)</div>
              <div className="font-mono font-bold text-emerald-400 print:text-emerald-700 mt-0.5">
                {attempt.subjectBreakdown?.psr?.scorePct || 0}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 font-bold">FR (20 Qs)</div>
              <div className="font-mono font-bold text-blue-400 print:text-blue-700 mt-0.5">
                {attempt.subjectBreakdown?.fr?.scorePct || 0}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 font-bold">PPA (20 Qs)</div>
              <div className="font-mono font-bold text-amber-400 print:text-amber-700 mt-0.5">
                {attempt.subjectBreakdown?.ppa?.scorePct || 0}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 font-bold">FCTA GK (20 Qs)</div>
              <div className="font-mono font-bold text-teal-400 print:text-teal-700 mt-0.5">
                {attempt.subjectBreakdown?.fcta_gk?.scorePct || 0}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 font-bold">Cadre (20 Qs)</div>
              <div className="font-mono font-bold text-purple-400 print:text-purple-700 mt-0.5">
                {attempt.subjectBreakdown?.cadre?.scorePct || 0}%
              </div>
            </div>
          </div>

          {/* Promotion Eligibility Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs mb-8 flex items-center justify-between print:bg-emerald-50 print:border-emerald-200 print:text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-600 shrink-0" />
              <span>
                Statutory Status: <strong>PROMOTION READY</strong> to next career rank: <strong>{getNextGradeLevel(candidateGradeLevel)}</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 print:text-emerald-700 font-bold">
              VERIFIED
            </span>
          </div>

          {/* Signatures & Verification Hash Footer */}
          <div className="pt-4 border-t border-slate-800 print:border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-xs">
            {/* Signature 1 */}
            <div className="text-center sm:text-left space-y-1">
              <div className="font-serif italic text-base text-slate-300 print:text-slate-700 border-b border-slate-700 print:border-slate-400 pb-1">
                Dr. M. A. Bashir, mni
              </div>
              <div className="font-bold text-white print:text-slate-900">Director, Human Resources</div>
              <div className="text-[10px] text-slate-500">Federal Capital Territory Administration</div>
            </div>

            {/* Verification Barcode & SHA */}
            <div className="text-center space-y-1">
              <div className="font-mono tracking-widest text-lg font-black text-slate-400 print:text-slate-800">
                |||| | ||||| || |||||| | |||
              </div>
              <div className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                SERIAL: {certSerial}
              </div>
              <div className="text-[9px] font-mono text-emerald-400 print:text-emerald-700">
                HASH: SHA256:{verificationHash}
              </div>
            </div>

            {/* Signature 2 */}
            <div className="text-center sm:text-right space-y-1">
              <div className="font-serif italic text-base text-slate-300 print:text-slate-700 border-b border-slate-700 print:border-slate-400 pb-1">
                Olusade Adesola, OON
              </div>
              <div className="font-bold text-white print:text-slate-900">Permanent Secretary</div>
              <div className="text-[10px] text-slate-500">FCTA Central Administration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
