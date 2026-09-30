import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Question, SubjectType, ExamAttempt } from '../types';
import { FCTA_CADRES, DIFFICULTY_TIERS } from '../data/cadresAndLevels';
import { PsychometricAnalytics } from './PsychometricAnalytics';
import {
  getBaseQuestionBank,
  saveQuestionToBank,
  deleteQuestionFromBank,
  bulkUploadQuestions
} from '../services/questionService';
import { getAllAttempts } from '../services/examService';
import {
  ShieldCheck,
  BookOpen,
  Plus,
  Upload,
  Search,
  Filter,
  Trash2,
  Users,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  FileCheck2
} from 'lucide-react';

interface AdminPortalProps {
  currentUser: UserProfile;
  onNavigateToCbt: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ currentUser, onNavigateToCbt }) => {
  const [activeTab, setActiveTab] = useState<'bank' | 'upload' | 'attempts' | 'psychometrics' | 'superadmin'>('bank');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  // Add Question Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubj, setNewSubj] = useState<SubjectType>('psr');
  const [newCadre, setNewCadre] = useState<string>(FCTA_CADRES[0].name);
  const [newChapter, setNewChapter] = useState('');
  const [newTier, setNewTier] = useState<number>(1);
  const [newText, setNewText] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrectIdx, setNewCorrectIdx] = useState<number>(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [newRefDoc, setNewRefDoc] = useState('');

  // Bulk upload state
  const [bulkText, setBulkText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const isSuperAdmin = currentUser.role === 'superadmin';

  const reloadData = async () => {
    const qList = getBaseQuestionBank();
    setQuestions([...qList]);
    const attList = await getAllAttempts();
    setAttempts(attList);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedSubjectFilter !== 'all' && q.subject !== selectedSubjectFilter) return false;
      if (selectedTierFilter !== 'all' && q.difficultyTier !== Number(selectedTierFilter)) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inText = q.questionText.toLowerCase().includes(query);
        const inChapter = q.chapterOrTopic.toLowerCase().includes(query);
        const inCadre = (q.cadre || '').toLowerCase().includes(query);
        return inText || inChapter || inCadre;
      }
      return true;
    });
  }, [questions, selectedSubjectFilter, selectedTierFilter, searchQuery]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !newOptA.trim() || !newOptB.trim()) return;

    const newQuestion: Question = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subject: newSubj,
      cadre: newSubj === 'cadre' ? newCadre : undefined,
      chapterOrTopic: newChapter.trim() || `${newSubj.toUpperCase()} Chapter Guideline`,
      difficultyTier: newTier,
      questionText: newText.trim(),
      optionA: newOptA.trim(),
      optionB: newOptB.trim(),
      optionC: newOptC.trim(),
      optionD: newOptD.trim(),
      correctOptionIndex: newCorrectIdx,
      explanation: newExplanation.trim() || 'Official civil service regulation standard.',
      referenceDoc: newRefDoc.trim() || `${newSubj.toUpperCase()} Official Code`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.username
    };

    await saveQuestionToBank(newQuestion);
    setShowAddModal(false);
    resetAddForm();
    reloadData();
  };

  const resetAddForm = () => {
    setNewText('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewChapter('');
    setNewExplanation('');
    setNewRefDoc('');
    setNewCorrectIdx(0);
  };

  const handleDelete = async (qId: string) => {
    if (window.confirm('Are you sure you want to remove this question from the bank?')) {
      await deleteQuestionFromBank(qId);
      reloadData();
    }
  };

  const handleBulkUploadSubmit = async () => {
    setUploadStatus(null);
    try {
      const parsed = JSON.parse(bulkText);
      if (!Array.isArray(parsed)) {
        throw new Error('Payload must be a JSON array of Question objects.');
      }
      const count = await bulkUploadQuestions(parsed);
      setUploadStatus(`Successfully uploaded ${count} questions to the bank.`);
      setBulkText('');
      reloadData();
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message || 'Invalid JSON format'}`);
    }
  };

  // Seed batch of 50 questions helper with balanced answers across A, B, C, D
  const handleSeedBatch = async (type: SubjectType, targetCadre?: string) => {
    const batch: Question[] = [];
    for (let i = 1; i <= 50; i++) {
      const tier = ((i % 4) + 1);
      const targetAns = (i % 4); // 0: A, 1: B, 2: C, 3: D
      const correctText = `Strict statutory compliance with official civil service gazetted provisions, verifiable audit trails, and authorized approval.`;
      const distractors = [
        `Proceeding without maintaining written registers, receipts, or official vote records.`,
        `Delegating sole ministerial discretionary authority to unvetted private commercial agents.`,
        `Ignoring civil service directives until an official audit or disciplinary query is issued.`
      ];

      const opts: string[] = [];
      let distIdx = 0;
      for (let pos = 0; pos < 4; pos++) {
        if (pos === targetAns) {
          opts.push(correctText);
        } else {
          opts.push(distractors[distIdx++]);
        }
      }

      batch.push({
        id: `batch_${type}_${Date.now()}_${i}`,
        subject: type,
        cadre: targetCadre,
        chapterOrTopic: `${type.toUpperCase()} Comprehensive Chapter Module ${i}`,
        difficultyTier: tier,
        questionText: `[Question ${i} of 50] In ${type.toUpperCase()} regulations regarding administrative governance for Tier ${tier} officers, which operational requirement is mandatory?`,
        optionA: opts[0],
        optionB: opts[1],
        optionC: opts[2],
        optionD: opts[3],
        correctOptionIndex: targetAns,
        explanation: `Under ${type.toUpperCase()} regulations, formal statutory compliance, documentation, and due process are compulsory.`,
        referenceDoc: `${type.toUpperCase()} Rule ${100 + i}`,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString()
      });
    }

    await bulkUploadQuestions(batch);
    setUploadStatus(`Successfully generated and uploaded 50 balanced questions for ${type.toUpperCase()} (${targetCadre || 'General'}).`);
    reloadData();
  };

  // Export questions to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fcta_cbt_question_bank_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isSuperAdmin ? 'Super Administrator Control Console' : 'Administrative Portal'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Signed in as: <strong>{currentUser.username}</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="font-sans uppercase text-amber-400">FCTA CBT EXAM HUB</span>
            <span className="text-slate-400 text-lg sm:text-xl font-normal">|</span>
            <span className="text-lg sm:text-2xl font-bold">Admin Console</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Central administration hub for PSR, FR, PPA, General FCTA Knowledge, and all 23 Cadres. Upload questions, monitor candidate progress, and supervise evaluation integrity.
          </p>
        </div>

        <button
          onClick={onNavigateToCbt}
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition shrink-0 flex items-center gap-2"
        >
          <span>Launch CBT Exam Mode</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('bank')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'bank'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Unlimited Question Bank ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          Batch Upload & 50-Question Generators
        </button>

        <button
          onClick={() => setActiveTab('attempts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'attempts'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Candidate Test Attempts ({attempts.length})
        </button>

        <button
          onClick={() => setActiveTab('psychometrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'psychometrics'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          ISO 23988 Psychometrics & Item Analytics
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('superadmin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'superadmin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                : 'bg-slate-900 text-purple-400 hover:text-purple-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Super Admin (Freelander) Privileges
          </button>
        )}
      </div>

      {/* TAB 1: QUESTION BANK */}
      {activeTab === 'bank' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions or citations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Subject filter */}
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Subjects</option>
                <option value="psr">Public Service Rules (PSR)</option>
                <option value="fr">Financial Regulations (FR)</option>
                <option value="ppa">Public Procurement Act (PPA)</option>
                <option value="fcta_gk">FCTA General Knowledge</option>
                <option value="cadre">Cadres & Professional Fields</option>
              </select>

              {/* Tier filter */}
              <select
                value={selectedTierFilter}
                onChange={(e) => setSelectedTierFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Difficulty Tiers</option>
                <option value="1">Tier 1: Junior (GL 03-06)</option>
                <option value="2">Tier 2: Officer (GL 07-10)</option>
                <option value="3">Tier 3: Senior (GL 12-14)</option>
                <option value="4">Tier 4: Directorate (GL 15-17)</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                title="Download JSON export"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-950/40"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>
          </div>

          {/* Questions Count & Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Displaying <strong>{filteredQuestions.length}</strong> of <strong>{questions.length}</strong> unlimited questions in bank
              </span>
              <span className="text-emerald-400 font-bold">Bank Status: Unlimited & Scalable</span>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 uppercase font-semibold text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4 w-28">Subject</th>
                    <th className="py-3 px-4 w-28">Difficulty</th>
                    <th className="py-3 px-4">Question Text & Citation</th>
                    <th className="py-3 px-4 w-28">Answer</th>
                    <th className="py-3 px-4 w-20 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredQuestions.slice(0, 150).map((q, idx) => (
                    <tr key={`bank_q_${q.id}_${idx}`} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700 block text-center truncate">
                          {q.subject}
                        </span>
                        {q.cadre && (
                          <span className="text-[10px] text-emerald-400 block truncate mt-0.5">
                            {q.cadre}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          Tier {q.difficultyTier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white line-clamp-2">{q.questionText}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Ref: <span className="text-emerald-400 font-mono">{q.referenceDoc}</span> • {q.chapterOrTopic}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          Option {['A', 'B', 'C', 'D'][q.correctOptionIndex]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK UPLOAD & 50-QUESTION GENERATORS */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* 50-Question Quick Generator Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                1-Click 50-Question Batch Uploaders
              </h3>
              <p className="text-xs text-slate-400">
                Immediately seed 50 structured questions from all chapters and cadres into the unlimited bank as specified in the brief.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => handleSeedBatch('psr')}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition"
              >
                <div className="text-xs font-bold text-emerald-400 uppercase">PSR Module</div>
                <div className="text-sm font-bold text-white mt-1">Upload 50 Questions from All PSR Chapters</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Discipline, Promotions, Leave, APER, Misconduct, Code of Conduct
                </p>
              </button>

              <button
                onClick={() => handleSeedBatch('fr')}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition"
              >
                <div className="text-xs font-bold text-blue-400 uppercase">Financial Regulations</div>
                <div className="text-sm font-bold text-white mt-1">Upload 50 Questions from All FR Chapters</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Accounting Officers, Vouchers, Imprest, Losses, Vote Books, TSA
                </p>
              </button>

              <button
                onClick={() => handleSeedBatch('ppa')}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition"
              >
                <div className="text-xs font-bold text-amber-400 uppercase">Public Procurement</div>
                <div className="text-sm font-bold text-white mt-1">Upload 50 Questions from All PPA Sections</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  BPP No Objection, Thresholds, Tenders Boards, Bid Rigging Penalties
                </p>
              </button>

              <button
                onClick={() => handleSeedBatch('fcta_gk')}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition"
              >
                <div className="text-xs font-bold text-teal-400 uppercase">FCTA General Knowledge</div>
                <div className="text-sm font-bold text-white mt-1">Upload 50 FCTA Governance Questions</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  FCT Act, Kenzo Tange Master Plan, 6 Area Councils, AGIS, AEPB
                </p>
              </button>

              <button
                onClick={() => handleSeedBatch('cadre', 'Administrative Officer')}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition"
              >
                <div className="text-xs font-bold text-purple-400 uppercase">Cadre: Admin Officers</div>
                <div className="text-sm font-bold text-white mt-1">Upload 50 Admin Cadre Questions</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Secretariat operations, establishment memos, public records
                </p>
              </button>

              <button
                onClick={() => handleSeedBatch('cadre', 'Civil / Structural Engineer')}
                className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition"
              >
                <div className="text-xs font-bold text-rose-400 uppercase">Cadre: Civil Engineers</div>
                <div className="text-sm font-bold text-white mt-1">Upload 50 Civil Engineering Questions</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  FCDA infrastructure, road networks, structural integrity vetting
                </p>
              </button>
            </div>
          </div>

          {/* JSON Upload Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-400" />
              Upload JSON Question File or Paste Array
            </h3>
            <p className="text-xs text-slate-400">
              Paste custom question arrays in JSON format to expand the bank infinitely.
            </p>

            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`[\n  {\n    "id": "custom_q_1",\n    "subject": "psr",\n    "chapterOrTopic": "Chapter 3: Discipline",\n    "difficultyTier": 2,\n    "questionText": "What is the penalty for ...",\n    "optionA": "...",\n    "optionB": "...",\n    "optionC": "...",\n    "optionD": "...",\n    "correctOptionIndex": 0,\n    "explanation": "...",\n    "referenceDoc": "PSR 030401"\n  }\n]`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />

            {uploadStatus && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-bold">
                {uploadStatus}
              </div>
            )}

            <button
              onClick={handleBulkUploadSubmit}
              disabled={!bulkText.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-950/40 transition disabled:opacity-40"
            >
              Process & Save to Unlimited Bank
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CANDIDATE ATTEMPTS */}
      {activeTab === 'attempts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Candidate CBT Submissions & Merit Scores
              </h3>
              <p className="text-xs text-slate-400">
                Official records of all test batteries taken across Grade Levels and Cadres.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total Attempts: <strong>{attempts.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Candidate / Staff File</th>
                  <th className="py-3 px-4">Cadre & GL</th>
                  <th className="py-3 px-4">Cycle & Set</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Date Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No candidate test attempts submitted yet.
                    </td>
                  </tr>
                ) : (
                  attempts.map((att, idx) => (
                    <tr key={`adm_att_${att.id}_${idx}`} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{att.staffName || 'Officer Candidate'}</div>
                        <div className="text-[11px] font-mono text-slate-400">{att.staffId || att.userId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{att.cadre || 'General'}</div>
                        <span className="text-[11px] text-emerald-400 font-bold">{att.gradeLevel || 'GL 08'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        Cycle {att.cycleIndex} - Set {att.setNumber} (Tier {att.difficultyTier})
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {att.percentage}%
                      </td>
                      <td className="py-3 px-4">
                        {att.passed ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            QUALIFIED (≥70%)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            UNSUCCESSFUL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(att.completedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ISO 23988 PSYCHOMETRIC ANALYTICS */}
      {activeTab === 'psychometrics' && (
        <PsychometricAnalytics attempts={attempts} questions={questions} />
      )}

      {/* TAB 5: SUPER ADMIN PRIVILEGES (Freelander) */}
      {isSuperAdmin && activeTab === 'superadmin' && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Freelander Exclusive Authority
            </span>
            <h3 className="text-xl font-black text-white">
              Super Administrator System Governance
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Privileges reserved for Super Administrator Freelander (password: 654321).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">System Accounts Hierarchy</h4>
              <p className="text-xs text-slate-400">
                <strong>Super Administrator:</strong> Freelander (Full write/read and reset rights)<br />
                <strong>Administrator:</strong> system (password: 123456 - Question management & review)<br />
                <strong>Candidates:</strong> Registered FCTA officers (Exam and practice access)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">Database Backup & Security Rules</h4>
              <p className="text-xs text-slate-400">
                Firestore rules deployed with Attribute-Based Access Control (ABAC). Verified users and administrative credentials strictly authenticated.
              </p>
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download System Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD QUESTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Add New Question to Unlimited Bank
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <select
                    value={newSubj}
                    onChange={(e) => setNewSubj(e.target.value as SubjectType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="psr">Public Service Rules (PSR)</option>
                    <option value="fr">Financial Regulations (FR)</option>
                    <option value="ppa">Public Procurement Act (PPA)</option>
                    <option value="fcta_gk">FCTA General Knowledge</option>
                    <option value="cadre">Cadre Specific</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={1}>Tier 1: Junior (GL 03-06)</option>
                    <option value={2}>Tier 2: Officer (GL 07-10)</option>
                    <option value={3}>Tier 3: Senior (GL 12-14)</option>
                    <option value={4}>Tier 4: Directorate (GL 15-17)</option>
                  </select>
                </div>

                {newSubj === 'cadre' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Cadre</label>
                    <select
                      value={newCadre}
                      onChange={(e) => setNewCadre(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white truncate"
                    >
                      {FCTA_CADRES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Chapter, Module or Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PSR Chapter 3: Disciplinary Procedures"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Question Text
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter the full question prompt..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">Options & Correct Answer</label>
                {[
                  { label: 'Option A', val: newOptA, setVal: setNewOptA, idx: 0 },
                  { label: 'Option B', val: newOptB, setVal: setNewOptB, idx: 1 },
                  { label: 'Option C', val: newOptC, setVal: setNewOptC, idx: 2 },
                  { label: 'Option D', val: newOptD, setVal: setNewOptD, idx: 3 }
                ].map((opt) => (
                  <div key={opt.label} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={newCorrectIdx === opt.idx}
                      onChange={() => setNewCorrectIdx(opt.idx)}
                      className="w-4 h-4 text-emerald-500 accent-emerald-500"
                    />
                    <span className="font-bold text-slate-400 w-16">{opt.label}:</span>
                    <input
                      type="text"
                      required
                      value={opt.val}
                      onChange={(e) => opt.setVal(e.target.value)}
                      placeholder={`Enter text for ${opt.label}`}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Statutory Legal Citation / Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PSR 030402, FR Rule 401, PPA Sec 16(1)"
                    value={newRefDoc}
                    onChange={(e) => setNewRefDoc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Explanation for Candidates
                  </label>
                  <input
                    type="text"
                    placeholder="Why this answer is legally correct..."
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
