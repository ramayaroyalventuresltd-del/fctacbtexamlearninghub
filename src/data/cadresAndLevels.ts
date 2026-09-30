import { CadreDefinition, GradeLevelDefinition } from '../types';

export const FCTA_CADRES: CadreDefinition[] = [
  {
    id: 'admin_officer',
    name: 'Administrative Officer',
    department: 'Administration & General Services',
    secretariat: 'FCTA Headquarters',
    description: 'Public policy execution, establishment matters, official correspondence, and civil service administration.'
  },
  {
    id: 'exec_officer',
    name: 'Executive Officer (General Duties)',
    department: 'Human Resources Management',
    secretariat: 'FCTA Secretariat',
    description: 'Registry management, personnel documentation, staff records, and administrative assistance.'
  },
  {
    id: 'accountant',
    name: 'Accountant / Finance Officer',
    department: 'Treasury & Accounts',
    secretariat: 'Treasury Division',
    description: 'Public sector accounting, e-payment (GIFMIS/TSA), budget defense, and vote book management.'
  },
  {
    id: 'auditor',
    name: 'Internal Auditor',
    department: 'Audit Department',
    secretariat: 'Minister\'s Office / FCTA',
    description: 'Pre-payment audit, financial compliance, value-for-money inspection, and statutory queries.'
  },
  {
    id: 'town_planner',
    name: 'Town Planning Officer / Urban Planner',
    department: 'Urban & Regional Planning',
    secretariat: 'Department of Development Control',
    description: 'Abuja Master Plan zoning enforcement, layout designs, land use compliance, and development permits.'
  },
  {
    id: 'civil_engineer',
    name: 'Civil / Structural Engineer',
    department: 'Engineering Services',
    secretariat: 'FCDA (Federal Capital Development Authority)',
    description: 'Roads, bridges, drainage networks, structural integrity tests, and capital project supervision.'
  },
  {
    id: 'electrical_engineer',
    name: 'Electrical / Mechanical Engineer',
    department: 'Facility Management & Works',
    secretariat: 'FCDA / FCTA',
    description: 'Public streetlights, power substation grids, HVAC, public building services, and maintenance.'
  },
  {
    id: 'architect',
    name: 'Architect',
    department: 'Public Building Department',
    secretariat: 'FCDA',
    description: 'Architectural vetting, institutional building designs, aesthetic compliance, and site inspection.'
  },
  {
    id: 'quantity_surveyor',
    name: 'Quantity Surveyor',
    department: 'Procurement & Cost Engineering',
    secretariat: 'FCDA / FCTA',
    description: 'Bill of quantities (BOQ), tender evaluation, interim valuation certificates, and project costing.'
  },
  {
    id: 'land_officer',
    name: 'Land Officer / Estate Surveyor & Valuer',
    department: 'Land Administration & AGIS',
    secretariat: 'Abuja Geographic Information Systems',
    description: 'Certificate of Occupancy (C of O), land title registration, valuation for compensation, and GIS data.'
  },
  {
    id: 'medical_officer',
    name: 'Medical Officer / Physician',
    department: 'Clinical Services',
    secretariat: 'Health and Human Services Secretariat (HHSS)',
    description: 'Public health delivery, clinical diagnosis, epidemiological control, and hospital operations.'
  },
  {
    id: 'nursing_officer',
    name: 'Nursing Officer',
    department: 'Nursing Services',
    secretariat: 'Hospital Management Board (HMB)',
    description: 'Patient care, public healthcare campaigns, clinical ward supervision, and medical ethics.'
  },
  {
    id: 'pharmacist',
    name: 'Pharmacist',
    department: 'Pharmaceutical Services',
    secretariat: 'HHSS / HMB',
    description: 'Essential drug procurement, drug storage and distribution, toxicology, and regulatory compliance.'
  },
  {
    id: 'med_lab_scientist',
    name: 'Medical Laboratory Scientist',
    department: 'Laboratory Diagnostic Services',
    secretariat: 'HHSS / HMB',
    description: 'Pathological diagnostics, blood transfusion quality checks, and diagnostic reporting.'
  },
  {
    id: 'environmental_health',
    name: 'Environmental Health Officer',
    department: 'Environmental Sanitation',
    secretariat: 'Abuja Environmental Protection Board (AEPB)',
    description: 'Solid waste management, pollution control, public sanitary inspection, and environmental impact audits.'
  },
  {
    id: 'education_officer',
    name: 'Education Officer / Teacher',
    department: 'Secondary & Primary Education',
    secretariat: 'Education Secretariat',
    description: 'Curriculum inspection, educational administration, classroom pedagogy, and school quality assurance.'
  },
  {
    id: 'legal_officer',
    name: 'Legal Officer / State Counsel',
    department: 'Legal Services Secretariat',
    secretariat: 'FCTA Legal Secretariat',
    description: 'Drafting executive orders, civil litigation for FCTA, contract drafting, and statutory legal advice.'
  },
  {
    id: 'info_officer',
    name: 'Information / Public Relations Officer',
    department: 'Public Relations & Information',
    secretariat: 'Minister\'s Press Corps / FCTA',
    description: 'Government crisis communications, press briefings, civic education, and media liaison.'
  },
  {
    id: 'agric_officer',
    name: 'Agricultural / Veterinary Officer',
    department: 'Agricultural Services',
    secretariat: 'Agriculture & Rural Development Secretariat (ARDS)',
    description: 'Food security, livestock vaccination, extension services, and agricultural input distribution.'
  },
  {
    id: 'it_officer',
    name: 'Computer / IT Officer (Systems Analyst)',
    department: 'Information & Communication Technology',
    secretariat: 'ICT Department',
    description: 'E-government platforms, cybersecurity, network infrastructure, database integrity, and CBT systems.'
  },
  {
    id: 'social_welfare',
    name: 'Social Welfare & Community Development Officer',
    department: 'Social Development',
    secretariat: 'Social Development Secretariat (SDS)',
    description: 'Vulnerable group rehabilitation, juvenile welfare, gender equality programs, and community mobilization.'
  },
  {
    id: 'fire_officer',
    name: 'Fire Service Officer',
    department: 'FCT Fire Service',
    secretariat: 'Disaster Management & Safety',
    description: 'Fire suppression, emergency rescue, fire hazard prevention inspection, and disaster mitigation.'
  },
  {
    id: 'tax_officer',
    name: 'Revenue / Tax Officer',
    department: 'Tax Assessment & Collection',
    secretariat: 'FCT Internal Revenue Service (FCT-IRS)',
    description: 'Direct assessment, PAYE compliance, tax audit, withholding taxes, and revenue reconciliation.'
  }
];

export const FCTA_GRADE_LEVELS: GradeLevelDefinition[] = [
  { level: 'GL 03', tier: 1, tierLabel: 'Level 1: Junior Cadre', description: 'Office Assistant / Junior Artisan' },
  { level: 'GL 04', tier: 1, tierLabel: 'Level 1: Junior Cadre', description: 'Senior Office Assistant / Driver' },
  { level: 'GL 05', tier: 1, tierLabel: 'Level 1: Junior Cadre', description: 'Clerical Officer / Works Assistant' },
  { level: 'GL 06', tier: 1, tierLabel: 'Level 1: Junior Cadre', description: 'Senior Clerical Officer / Chief Driver' },
  { level: 'GL 07', tier: 2, tierLabel: 'Level 2: Officer / Middle Cadre', description: 'Assistant Executive Officer / Technical Officer' },
  { level: 'GL 08', tier: 2, tierLabel: 'Level 2: Officer / Middle Cadre', description: 'Officer II (Graduate Entry Point)' },
  { level: 'GL 09', tier: 2, tierLabel: 'Level 2: Officer / Middle Cadre', description: 'Officer I' },
  { level: 'GL 10', tier: 2, tierLabel: 'Level 2: Officer / Middle Cadre', description: 'Senior Officer' },
  { level: 'GL 12', tier: 3, tierLabel: 'Level 3: Senior Management', description: 'Principal Officer' },
  { level: 'GL 13', tier: 3, tierLabel: 'Level 3: Senior Management', description: 'Assistant Chief Officer' },
  { level: 'GL 14', tier: 3, tierLabel: 'Level 3: Senior Management', description: 'Chief Officer' },
  { level: 'GL 15', tier: 4, tierLabel: 'Level 4: Directorate Level', description: 'Assistant Director' },
  { level: 'GL 16', tier: 4, tierLabel: 'Level 4: Directorate Level', description: 'Deputy Director' },
  { level: 'GL 17', tier: 4, tierLabel: 'Level 4: Directorate Level', description: 'Director / Permanent Secretary' }
];

export function getTierForGradeLevel(gl: string): number {
  const match = FCTA_GRADE_LEVELS.find(item => item.level.toUpperCase() === gl.toUpperCase());
  return match ? match.tier : 2;
}

export const DIFFICULTY_TIERS = [
  {
    tier: 1,
    title: 'Level 1 (GL 03 - 06)',
    subtitle: 'Junior Cadre Assessment',
    description: 'Foundational civil service conduct, punctuality, basic PSR general provisions, elementary office safety, and fundamental ethics.',
    glRange: 'GL 03 to GL 06',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-300'
  },
  {
    tier: 2,
    title: 'Level 2 (GL 07 - 10)',
    subtitle: 'Officer & Middle Cadre Assessment',
    description: 'Standard administrative procedures, routine Financial Regulations, PPA low-threshold procurement, cadre-specific operations, and FCTA structures.',
    glRange: 'GL 07 to GL 10',
    badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-300'
  },
  {
    tier: 3,
    title: 'Level 3 (GL 12 - 14)',
    subtitle: 'Senior Management Assessment',
    description: 'Disciplinary hearing procedures, departmental vote management, tenders board processes, personnel appraisal, and strategic cadre governance.',
    glRange: 'GL 12 to GL 14',
    badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-300'
  },
  {
    tier: 4,
    title: 'Level 4 (GL 15 - 17)',
    subtitle: 'Directorate & Leadership Assessment',
    description: 'Strategic public policy formulation, high-level fiscal compliance, Federal Executive Council/Ministerial approvals, legal constitutional frameworks, and executive leadership.',
    glRange: 'GL 15 to GL 17',
    badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-300'
  }
];

export const SLIDER_STEPS = [
  {
    id: 1,
    title: '1. Register & Select Cadre/Grade',
    tagline: 'Personalized Civil Service Exam Path',
    description: 'Create your candidate profile with your FCTA Staff File Number, choose your professional cadre (e.g. Admin, Finance, Engineering, Health) and Grade Level (GL 03–17). The portal automatically configures your syllabus.',
    iconName: 'UserCheck',
    color: 'from-emerald-600 to-teal-800',
    highlights: ['23+ FCTA Cadres', 'GL 03 to GL 17 Mappings', 'Personalized Syllabus']
  },
  {
    id: 2,
    title: '2. 4 Progressive Difficulty Levels',
    tagline: 'Equal 20% Subject Balancing Across 100 Qs',
    description: 'Every test delivers exactly 100 questions distributed equally (20% each) across PSR (20 Qs), FR (20 Qs), PPA (20 Qs), FCTA General Knowledge (20 Qs), and your chosen Cadre (20 Qs).',
    iconName: 'Layers',
    color: 'from-blue-600 to-indigo-800',
    highlights: ['PSR (20 Questions)', 'FR (20 Questions)', 'PPA (20 Questions)', 'FCTA GK & Cadre (40 Questions)']
  },
  {
    id: 3,
    title: '3. 70% Passmark & Set Unlocking',
    tagline: 'Merit-Based Progression Protocol',
    description: 'Score 70% (70/100) or higher to unlock the subsequent exam set. Progress sequentially from Set 1 through Set 4 to complete the entire official promotion qualification curriculum.',
    iconName: 'Award',
    color: 'from-amber-600 to-yellow-800',
    highlights: ['70% Qualification Bar', 'Sequential Unlocks', 'Instant Result Breakdown & Citations']
  },
  {
    id: 4,
    title: '4. Exam Console & Time Controls',
    tagline: 'Official CBT Interface with 30, 45 or 60 Min Timers',
    description: 'Choose your desired timer (30, 45, or 60 minutes) with auto-submission, 5-minute warning alert, question status palette (Answered, Flagged, Unanswered), and pop-up arithmetic calculator.',
    iconName: 'Clock',
    color: 'from-red-600 to-rose-800',
    highlights: ['30 / 45 / 60 Min Options', '1-100 Question Grid', 'Built-in Calculator & Flagging']
  },
  {
    id: 5,
    title: '5. Infinite Non-Duplicating Cycles',
    tagline: 'Unlimited Question Bank Generation',
    description: 'Once all 4 sets are conquered, generate an entirely fresh battery of four 100-question exams. The engine strictly excludes previously answered questions to ensure zero duplicates!',
    iconName: 'RefreshCw',
    color: 'from-purple-600 to-violet-800',
    highlights: ['Zero Duplicate Engine', 'Unlimited Question Bank', 'Historical Mastery Archive']
  }
];
