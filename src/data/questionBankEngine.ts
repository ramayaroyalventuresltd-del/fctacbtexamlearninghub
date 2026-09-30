import { Question, SubjectType } from '../types';
import { FCTA_CADRES } from './cadresAndLevels';

/**
 * Shuffles the answer options of a question so the correct answer is
 * dynamically placed across A (0), B (1), C (2), or D (3).
 * If targetIndex (0-3) is passed, places the correct answer at that exact letter.
 * Otherwise, randomizes the order using Fisher-Yates shuffle.
 */
export function shuffleQuestionOptions(q: Question, targetIndex?: number): Question {
  const options = [
    { text: q.optionA, isCorrect: q.correctOptionIndex === 0 },
    { text: q.optionB, isCorrect: q.correctOptionIndex === 1 },
    { text: q.optionC, isCorrect: q.correctOptionIndex === 2 },
    { text: q.optionD, isCorrect: q.correctOptionIndex === 3 },
  ];

  let newOrder: typeof options;
  if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= 3) {
    const correctOpt = options.find((o) => o.isCorrect) || options[0];
    const incorrectOpts = options.filter((o) => o !== correctOpt);
    newOrder = [];
    let incIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i === targetIndex) {
        newOrder.push(correctOpt);
      } else {
        newOrder.push(incorrectOpts[incIdx++]);
      }
    }
  } else {
    newOrder = [...options];
    for (let i = newOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
    }
  }

  const newCorrectIndex = newOrder.findIndex((o) => o.isCorrect);

  return {
    ...q,
    optionA: newOrder[0].text,
    optionB: newOrder[1].text,
    optionC: newOrder[2].text,
    optionD: newOrder[3].text,
    correctOptionIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

// Generates an extensive, unlimited question pool across all chapters and domains
export function generateCoreQuestionBank(): Question[] {
  const bank: Question[] = [];

  // ==========================================
  // 1. PUBLIC SERVICE RULES (PSR) - ALL CHAPTERS
  // ==========================================
  const psrTopics = [
    {
      chapter: 'PSR Chapter 1: Introduction & Scope',
      tier1: {
        q: 'According to Public Service Rules, who is recognized as an "Officer" in the Federal Public Service?',
        options: [
          'Any pensionable or established employee holding an appointment in the Public Service',
          'Only political office holders appointed directly by the President',
          'Contract employees engaged on casual daily wages',
          'Private consultants rendering professional advisory services'
        ],
        ans: 0,
        ref: 'PSR Rule 010101',
        exp: 'PSR 010101 defines an Officer as any person holding, or acting in, an established office in the Public Service of the Federation.'
      },
      tier2: {
        q: 'Which authority is constitutionally vested with the power to appoint, promote, and discipline established officers in the Public Service?',
        options: [
          'Federal Civil Service Commission (or designated FCT Civil Service Commission)',
          'The Federal Ministry of Finance Treasury Board',
          'The Association of Senior Civil Servants of Nigeria (ASCSN)',
          'The Central Bank of Nigeria Public Personnel Directorate'
        ],
        ans: 0,
        ref: 'PSR Rule 010202 & 1999 Constitution Sec 153',
        exp: 'The Civil Service Commission holds the statutory power to appoint, confirm, promote, and discipline officers in established posts.'
      },
      tier3: {
        q: 'Under the revised Public Service Rules, what is the mandatory ceiling on the tenure of Permanent Secretaries and Directors in the Public Service?',
        options: [
          'A maximum tenure of two terms of 4 years each for Permanent Secretaries; single 8-year term for Directors',
          'An unlimited tenure until the officer reaches 70 years of age',
          'Tenure of 12 continuous years regardless of grade level',
          'Five years renewable annually by vote of National Assembly'
        ],
        ans: 0,
        ref: 'PSR Rule 020810 (Revised 2021/2023 Guidelines)',
        exp: 'The revised PSR enforces an 8-year tenure limit for Directors and a 4-year tenure renewable once for Permanent Secretaries subject to retirement age.'
      },
      tier4: {
        q: 'Under PSR Chapter 1, what constitutional doctrine governs the subordination of civil servants to legitimate Ministerial executive directives?',
        options: [
          'Civil Service Neutrality and Ministerial Responsibility',
          'Judicial Discretion and Sovereign Immunity',
          'Private Sector Executive Autonomy',
          'Direct Electoral Accountability'
        ],
        ans: 0,
        ref: 'PSR Chapter 1 & Nigerian Public Service Doctrine',
        exp: 'Public officers are bound by civil service political neutrality while executing lawful policies formulated under Ministerial responsibility.'
      }
    },
    {
      chapter: 'PSR Chapter 2: Appointments, Promotions & Transfers',
      tier1: {
        q: 'What is the standard statutory probationary period for newly appointed pensionable officers before confirmation?',
        options: ['Two (2) years', 'Six (6) months', 'Five (5) years', 'Ten (10) years'],
        ans: 0,
        ref: 'PSR Rule 020301',
        exp: 'Every new appointee to a pensionable establishment post serves a probationary period of two years before consideration for confirmation.'
      },
      tier2: {
        q: 'What is the minimum maturity period required for an officer on GL 07 to be eligible for promotion to GL 08?',
        options: ['Three (3) years', 'Two (2) years', 'Four (4) years', 'Five (5) years'],
        ans: 0,
        ref: 'PSR Rule 020701',
        exp: 'Officers on Grade Levels 06 to 14 require a minimum maturity period of three (3) years before being eligible for promotion examination.'
      },
      tier3: {
        q: 'For officers on Grade Levels 15 to 17, what is the mandatory maturity period required between promotions?',
        options: ['Four (4) years', 'Two (2) years', 'Three (3) years', 'Six (6) years'],
        ans: 0,
        ref: 'PSR Rule 020702',
        exp: 'Officers in senior management and directorate cadres (GL 15 and above) require a minimum maturity period of four (4) years between promotions.'
      },
      tier4: {
        q: 'When an officer seeks inter-cadre transfer or lateral transfer between extra-ministerial departments, what is the prerequisite requirement?',
        options: [
          'Acquisition of relevant professional prerequisite qualification, vacancy declaration, and Civil Service Commission approval',
          'Automatic lateral migration upon personal oral application to the Chief Registry Clerk',
          'Approval solely by the labor union without management sanction',
          'Payment of an administrative transfer fee to the Treasury'
        ],
        ans: 0,
        ref: 'PSR Rule 020501 & 020502',
        exp: 'Transfers require verifiable professional prerequisites, existing certified vacancy, recommendation by the releasing/receiving ministries, and formal approval by the Commission.'
      }
    },
    {
      chapter: 'PSR Chapter 3: Discipline & Serious Misconduct',
      tier1: {
        q: 'Which of the following acts is classified as "General Misconduct" under Public Service Rules?',
        options: [
          'Habitual lateness to work, negligence of duty, and improper dressing',
          'Embezzlement of five billion Naira',
          'Subversive activities against the sovereignty of the Federal Republic',
          'Divulging classified defense secrets'
        ],
        ans: 0,
        ref: 'PSR Rule 030301',
        exp: 'Habitual lateness, careless performance of duties, and insubordination constitute General Misconduct (punishable by query, reprimand, or withholding of increment).'
      },
      tier2: {
        q: 'Which of the following constitutes "Serious Misconduct" under the Public Service Rules?',
        options: [
          'Falsification of official records, financial misappropriation, and bribery',
          'Wearing traditional attire on a Friday',
          'Taking permitted 30-minute lunch break in the staff cafeteria',
          'Submitting annual leave application three weeks in advance'
        ],
        ans: 0,
        ref: 'PSR Rule 030401 & 030402',
        exp: 'Serious Misconduct comprises grave ethical violations including forgery, embezzlement, unauthorized disclosure of official documents, and corruption.'
      },
      tier3: {
        q: 'What is the maximum timeline allowed for an accused officer to formally respond to a written query under disciplinary proceedings?',
        options: [
          'Forty-eight (48) hours from receipt of the query',
          'Thirty (30) calendar days',
          'Fourteen (14) working weeks',
          'One calendar year'
        ],
        ans: 0,
        ref: 'PSR Rule 030302',
        exp: 'Officers issued an official query must submit their written representation within 48 hours unless a formal extension of time is officially granted.'
      },
      tier4: {
        q: 'Under what legal circumstances may an officer under formal disciplinary interdiction receive only fifty percent (50%) of their basic salary?',
        options: [
          'When interdicted following prima facie establishment of serious misconduct pending tribunal or criminal trial',
          'Whenever an officer takes approved maternity leave',
          'When an officer proceeds on approved overseas training',
          'When the officer files a civil court action against a commercial bank'
        ],
        ans: 0,
        ref: 'PSR Rule 030404 & 030405',
        exp: 'An interdicted officer is entitled to half of their basic salary pending determination of charges; full arrears are refunded if completely exonerated.'
      }
    },
    {
      chapter: 'PSR Chapter 7: Retirement & Separation',
      tier1: {
        q: 'What is the mandatory statutory retirement age or length of service in the Federal Public Service (excepting judicial and academic exemptions)?',
        options: [
          '60 years of age or 35 years of pensionable service, whichever is earlier',
          '70 years of age or 40 years of service',
          '50 years of age regardless of years in service',
          'Unlimited tenure at the officer\'s personal discretion'
        ],
        ans: 0,
        ref: 'PSR Rule 020810',
        exp: 'Civil servants are statutorily required to retire upon reaching 60 years of age or completing 35 years of pensionable service, whichever comes first.'
      },
      tier2: {
        q: 'How many months in advance must an officer give notice of statutory retirement or voluntary resignation to the government?',
        options: ['Three (3) months', 'One (1) month', 'Six (6) months', 'Twelve (12) months'],
        ans: 0,
        ref: 'PSR Rule 020803',
        exp: 'An officer planning voluntary retirement or statutory separation must submit a written notice at least three months in advance, or pay salary in lieu.'
      },
      tier3: {
        q: 'Under what circumstances may an officer be retired on medical grounds under PSR Chapter 7?',
        options: [
          'Certification by a duly constituted Medical Board that the officer is permanently incapacitated from performing official duties',
          'Submission of a non-certified private hospital sick note for common cold',
          'Self-diagnosis communicated via email to the Human Resources registry',
          'Refusal to undergo physical fitness testing during sports day'
        ],
        ans: 0,
        ref: 'PSR Rule 070102',
        exp: 'Retirement on medical grounds requires the formal examination and statutory certification of an authorized Medical Board.'
      },
      tier4: {
        q: 'What is the consequence under the Pensions Reform Act and PSR when an officer is summarily dismissed from the Public Service for gross criminal fraud?',
        options: [
          'Forfeiture of all retirement gratuity, pensions, and statutory terminal benefits',
          'Immediate promotion to Director Grade with double pension benefits',
          'Receipt of golden handshake package from the Ministry',
          'Automatic transfer of service to the diplomatic mission'
        ],
        ans: 0,
        ref: 'PSR Rule 030407 & Pension Reform Act 2014',
        exp: 'Dismissal results in the forfeiture of all claims to pension, gratuity, and terminal emoluments, subject to statutory judicial appeals.'
      }
    },
    {
      chapter: 'PSR Chapter 10 & 11: Leave Entitlements & Official Conduct',
      tier1: {
        q: 'What is the standard annual leave entitlement for officers on Grade Levels 03 to 06?',
        options: ['Fourteen (14) calendar days', 'Thirty (30) calendar days', 'Sixty (60) calendar days', 'Ninety (90) calendar days'],
        ans: 0,
        ref: 'PSR Rule 100201',
        exp: 'Officers on Grade Levels 03 to 06 are entitled to 14 calendar days of annual leave per year.'
      },
      tier2: {
        q: 'What is the annual leave entitlement for officers on Grade Levels 07 to 17?',
        options: ['Thirty (30) calendar days', 'Fourteen (14) calendar days', 'Forty-five (45) calendar days', 'Twenty-one (21) calendar days'],
        ans: 0,
        ref: 'PSR Rule 100202',
        exp: 'Officers on GL 07 and above are statutorily entitled to 30 calendar days of annual leave.'
      },
      tier3: {
        q: 'What is the duration of maternity leave granted to female civil servants under the revised Public Service Rules?',
        options: [
          'Sixteen (16) weeks with full pay',
          'Six (6) weeks with half pay',
          'Eight (8) weeks without pay',
          'Twelve (12) months sabbatical'
        ],
        ans: 0,
        ref: 'PSR Rule 100301 (Revised Guidelines)',
        exp: 'Female public officers are entitled to 16 weeks maternity leave on full pay, normally commencing not earlier than four weeks before expected delivery.'
      },
      tier4: {
        q: 'What does PSR Chapter 10 state regarding public officers engaging in private trade, commerce, or corporate directorships?',
        options: [
          'Officers are strictly prohibited from engaging in private commercial business, except farming/agriculture',
          'Officers are encouraged to operate private construction contracting companies bidding for their own ministry',
          'Officers may serve as full-time managing directors of public stockbroking firms',
          'No restrictions apply provided work is done during weekends'
        ],
        ans: 0,
        ref: 'PSR Rule 030424 & Constitution 5th Schedule',
        exp: 'The Code of Conduct and PSR forbid civil servants from running private enterprises while in active service, except engaging in agricultural farming.'
      }
    }
  ];

  // ==========================================
  // 2. FINANCIAL REGULATIONS (FR) - ALL CHAPTERS
  // ==========================================
  const frTopics = [
    {
      chapter: 'FR Chapter 1: Accounting Officers & Responsibilities',
      tier1: {
        q: 'Who is officially designated as the Accounting Officer of a Ministry or Extra-Ministerial Department?',
        options: [
          'The Permanent Secretary (or designated Chief Executive Officer)',
          'The Principal Cashier in the accounts hall',
          'The Chief Clerical Registry Attendant',
          'The Federal Minister of Aviation'
        ],
        ans: 0,
        ref: 'FR Rule 101 & 102',
        exp: 'The Permanent Secretary or Chief Executive is the designated Accounting Officer personally responsible for safeguarding public funds and votes.'
      },
      tier2: {
        q: 'Which official document confers legal authority on an Accounting Officer to incur expenditure from the approved annual budget?',
        options: [
          'General Warrant or Specific Warrant issued by the Minister of Finance',
          'An informal oral phone call from a friend in budget office',
          'A press release published on social media',
          'A personal promissory note written by the internal auditor'
        ],
        ans: 0,
        ref: 'FR Rule 301 & 302',
        exp: 'No expenditure may be incurred from public funds without a formal General Warrant, Provisional Warrant, or Statutory Expenditure Warrant issued by the Minister of Finance.'
      },
      tier3: {
        q: 'Under FR Chapter 1, what is the personal financial liability of an Accounting Officer who authorizes unapproved expenditure exceeding vote allocations?',
        options: [
          'The officer is held personally pecuniary liable to surcharge and face Public Accounts Committee sanctions',
          'The excess expenditure is automatically forgiven without query',
          'The Central Bank compensates the difference from foreign reserves',
          'The junior cashiers are sentenced without investigating the signatory'
        ],
        ans: 0,
        ref: 'FR Rule 105 & 106',
        exp: 'Accounting Officers who incur unauthorized expenditure beyond approved appropriations are personally liable to surcharge and disciplinary prosecution.'
      },
      tier4: {
        q: 'In terms of Treasury Single Account (TSA) protocol, where must all government revenues and receipts collected by FCTA agencies be deposited?',
        options: [
          'Into the Consolidated Revenue Fund / TSA sub-account at the Central Bank of Nigeria',
          'In secret commercial bank fixed deposit accounts operated by individual directors',
          'In offshore crypto-currency wallets owned by account clerks',
          'Stored in cash safes in private residences'
        ],
        ans: 0,
        ref: 'FR Rule 601 & Presidential TSA Directive',
        exp: 'All public revenues must be paid directly into the Consolidated Revenue Fund / Treasury Single Account via designated CBN collection gateways.'
      }
    },
    {
      chapter: 'FR Chapter 6 & 8: Custody of Public Money & Imprest',
      tier1: {
        q: 'What is a "Standing Imprest" in government financial administration?',
        options: [
          'A fixed sum of money allocated to an officer to meet urgent petty operational disbursements that are regularly replenished',
          'A lifetime non-refundable personal loan granted to an employee',
          'The total annual national budget of the Federation',
          'A gratuity lump sum paid upon death of a pensioner'
        ],
        ans: 0,
        ref: 'FR Rule 801 & 802',
        exp: 'An imprest is an advance issued to a designated officer to make petty cash disbursements, replenished upon presentation of verified vouchers.'
      },
      tier2: {
        q: 'On what date must all standing and special imprests be fully retired and accounted for each fiscal year?',
        options: [
          'On or before the 31st of December of the financial year',
          'Within five years from date of issuance',
          'On the birthday of the imprest holder',
          'Never; imprest balances roll over indefinitely without reconciliation'
        ],
        ans: 0,
        ref: 'FR Rule 805',
        exp: 'All unspent imprest cash balances and retirement vouchers must be surrendered on or before the close of business on 31st December of the financial year.'
      },
      tier3: {
        q: 'What key security measure is legally mandatory for safeguarding public cash and check leaves in government sub-treasuries?',
        options: [
          'Dual-custody safe or strongroom with two different keys held by two independent senior officers',
          'Leaving cash on top of the reception counter overnight',
          'Keeping keys in an unlocked drawer accessible to office visitors',
          'Hiding cash inside paper cartons under the staircase'
        ],
        ans: 0,
        ref: 'FR Rule 604 & 605',
        exp: 'Treasury safes and strongrooms must operate on dual-key control system where Key A and Key B are held by separate independent custodians.'
      },
      tier4: {
        q: 'What is the immediate statutory step when a loss of public funds or fraudulent diversion is discovered in an MDA?',
        options: [
          'Issue an immediate interim report to the Accountant-General, convene a Board of Survey, and report to law enforcement',
          'Conceal the shortage until the next fiscal audit cycle',
          'Debiting the loss to fictitious expense accounts without reporting',
          'Borrowing money from commercial microfinance banks to balance the safe'
        ],
        ans: 0,
        ref: 'FR Chapter 17 & Rule 1701',
        exp: 'FR Chapter 17 requires immediate dispatch of Treasury Form 156 (Loss of Funds) to the Accountant-General, Auditor-General, and Police within 24 hours.'
      }
    },
    {
      chapter: 'FR Chapter 11 & 14: Payment Vouchers & Vote Books',
      tier1: {
        q: 'What is the primary function of a "Departmental Vote Book" in financial administration?',
        options: [
          'To record budgetary allocations, commitments, and actual expenditures against each budget subhead to prevent overspending',
          'To record the names of staff taking part in staff union elections',
          'To list attendees at the annual end-of-year dinner',
          'To calculate car loans for junior employees'
        ],
        ans: 0,
        ref: 'FR Rule 1401 & 1402',
        exp: 'The Departmental Vote Book tracks vote allocation, liabilities/commitments, and expenditures, ensuring spending remains strictly within approved limits.'
      },
      tier2: {
        q: 'Which mandatory certificate must be endorsed on a payment voucher before the Internal Audit unit passes it for e-payment?',
        options: [
          'Certificate that goods were received in good condition / services satisfactorily rendered and charges are fair and reasonable',
          'Certificate that the contractor is an immediate relative of the cashier',
          'Certificate stating that no receipt or invoice was supplied',
          'Certificate that the company is exempted from paying tax'
        ],
        ans: 0,
        ref: 'FR Rule 1104',
        exp: 'FR 1104 mandates the officer certifying the voucher to verify that stores have been taken on charge, work satisfactorily done, and price calculations are accurate.'
      },
      tier3: {
        q: 'What is the statutory consequence of making a payment on a voucher without valid supporting documents (receipts, delivery notes, store receipts)?',
        options: [
          'The payment is treated as an unvouched/unsupported expenditure, attracting an audit query and surcharge of the certifying officer',
          'It is approved as exemplary best practice in public accounting',
          'The officer is awarded an honorarium by the Treasury',
          'The transaction is permanently erased from the ledger'
        ],
        ans: 0,
        ref: 'FR Rule 1108 & 1111',
        exp: 'Payments lacking authentic original receipts and delivery documents are classified as unvouched expenditure and queried by the Auditor-General.'
      },
      tier4: {
        q: 'How does the GIFMIS (Government Integrated Financial Management Information System) enforce commitment control under modern FR standards?',
        options: [
          'It blocks purchase orders and payment vouchers automatically if the budget line has insufficient uncommitted funds',
          'It allows unlimited deficit spending regardless of appropriation limits',
          'It prints currency notes directly inside ministry offices',
          'It bypasses the Central Bank of Nigeria'
        ],
        ans: 0,
        ref: 'FR Revised Framework & GIFMIS Operations Manual',
        exp: 'GIFMIS electronic commitment controls automatically reject transactions that exceed available budgetary allocations on the approved chart of accounts.'
      }
    }
  ];

  // ==========================================
  // 3. PUBLIC PROCUREMENT ACT (PPA) 2007 - ALL SECTIONS
  // ==========================================
  const ppaTopics = [
    {
      chapter: 'PPA Part I & II: Regulatory Framework & BPP',
      tier1: {
        q: 'What is the full statutory name of the apex regulatory agency established by the Public Procurement Act 2007?',
        options: [
          'Bureau of Public Procurement (BPP)',
          'Federal Ministry of Public Purchases',
          'Nigeria Contract Award Commission',
          'Federal Tenders Distribution Authority'
        ],
        ans: 0,
        ref: 'PPA 2007 Sec 3(1)',
        exp: 'The Bureau of Public Procurement (BPP) was established under Section 3 of the Public Procurement Act 2007 as the regulatory agency for public procurement.'
      },
      tier2: {
        q: 'What official document must be issued by the BPP before high-value contracts are presented to the Federal Executive Council (FEC) for approval?',
        options: [
          'Certificate of "No Objection" to Contract Award',
          'Commercial Letter of Credit',
          'Ministry Exemption Certificate',
          'Private Bank Guarantee of Solvency'
        ],
        ans: 0,
        ref: 'PPA 2007 Sec 16(1) & 16(4)',
        exp: 'The Certificate of No Objection to Contract Award validates that procurement procedures strictly adhered to the statutory provisions of the Act.'
      },
      tier3: {
        q: 'What is the primary statutory default method of procurement prescribed by the Public Procurement Act 2007?',
        options: [
          'Open Competitive National/International Bidding',
          'Direct Emergency Selective Award without advertisement',
          'Single Source Procurement through sole patronage',
          'Informal negotiation via telephonic bids'
        ],
        ans: 0,
        ref: 'PPA 2007 Sec 24(1)',
        exp: 'Section 24(1) establishes that open competitive bidding shall be the primary default procedure for all public procurements of goods, works, and services.'
      },
      tier4: {
        q: 'What is the maximum statutory mobilization fee that may be paid to a contractor upon contract award under Section 35 of the PPA 2007?',
        options: [
          'Not more than 15% of the contract sum, conditioned on an unconditional bank guarantee',
          'Up to 80% without any bank guarantee or collateral',
          '100% upfront payment upon signing',
          'Zero percent; all government contracts must be completed 100% on credit'
        ],
        ans: 0,
        ref: 'PPA 2007 Sec 35',
        exp: 'Section 35 restricts advance mobilization to a maximum of 15% of contract value, strictly backed by an unconditional bank guarantee from a reputable financial institution.'
      }
    },
    {
      chapter: 'PPA Part IV & V: Tenders Boards & Thresholds',
      tier1: {
        q: 'Who chairs the Ministerial/Secretariat Tenders Board (MTB/STB) in an MDA or FCTA Mandate Secretariat?',
        options: [
          'The Permanent Secretary (or designated Mandate Secretary / Director of Procurement)',
          'The external contractor with the highest bid price',
          'The union branch chairman',
          'The Chief Security Officer of the building'
        ],
        ans: 0,
        ref: 'PPA 2007 Sec 17 & 21',
        exp: 'The Permanent Secretary or Chief Executive Officer chairs the Ministerial/Secretariat Tenders Board.'
      },
      tier2: {
        q: 'Under PPA 2007, what is the mandatory minimum advertisement period required for National Competitive Bidding?',
        options: [
          'At least six (6) weeks in two national daily newspapers and the Federal Tenders Journal',
          'Twenty-four (24) hours on a roadside billboard',
          'Three (3) calendar days on a private blog',
          'Twelve (12) calendar months'
        ],
        ans: 0,
        ref: 'PPA 2007 Sec 25(2)',
        exp: 'National Competitive Bidding requires a minimum solicitation advertisement of six weeks in at least two national daily newspapers and the Federal Tenders Journal.'
      },
      tier3: {
        q: 'Under what specific conditions does Section 42 of the PPA permit the use of "Direct / Single-Source Procurement"?',
        options: [
          'When goods/services are available only from a particular supplier holding exclusive patents, or in extreme urgent national disasters',
          'Whenever an Accounting Officer wants to favor a personal acquaintance',
          'When procurement funds are expiring at the end of the month',
          'Whenever the tenders board does not want to read multiple bid documents'
        ],
        ans: 0,
        ref: 'PPA 2007 Sec 42',
        exp: 'Single-source procurement is strictly restricted to cases of exclusive proprietary patent rights or catastrophic national emergencies where competition is impossible.'
      },
      tier4: {
        q: 'What is the criminal penalty prescribed by Section 58 of the PPA 2007 for public officers or contractors found guilty of bid rigging, collusion, or procurement fraud?',
        options: [
          'A term of imprisonment of not less than 5 calendar years without option of fine, dismissal, and debarment',
          'A verbal apology written to the local newspaper',
          'Payment of a one thousand Naira administrative fine',
          'A paid luxury vacation to the United Kingdom'
        ],
        ans: 0,
        ref: 'PPA 2007 Sec 58',
        exp: 'Section 58 stipulates strict penal sanctions including minimum 5 years imprisonment, forfeiture of illicit gains, and lifetime ban from public contracting.'
      }
    }
  ];

  // ==========================================
  // 4. FCTA GENERAL KNOWLEDGE & GOVERNANCE
  // ==========================================
  const fctaTopics = [
    {
      chapter: 'FCTA Constitutional & Legal Foundations',
      tier1: {
        q: 'Under the Constitution of the Federal Republic of Nigeria 1999 (as amended), how is the Federal Capital Territory (FCT) treated for administrative governance?',
        options: [
          'As if it were one of the States of the Federation, with the President acting as Governor and National Assembly as Legislature',
          'As a sovereign foreign independent territory outside Nigeria',
          'As a private commercial corporate estate owned by FCDA engineers',
          'As a military garrison zone without any civil laws'
        ],
        ans: 0,
        ref: '1999 Constitution Section 299',
        exp: 'Section 299 of the 1999 Constitution provides that the provisions of the Constitution apply to the FCT as if it were one of the States of the Federation.'
      },
      tier2: {
        q: 'How many Area Councils constitute the Federal Capital Territory?',
        options: [
          'Six (6) Area Councils: AMAC, Bwari, Gwagwalada, Kuje, Kwali, and Abaji',
          'Ten (10) Local Government Councils',
          'Only one unified municipal council',
          'Thirty-six (36) Area Councils'
        ],
        ans: 0,
        ref: 'FCT Act Cap F6 LFN 2004',
        exp: 'The FCT is divided into 6 Area Councils: Abuja Municipal Area Council (AMAC), Bwari, Gwagwalada, Kuje, Kwali, and Abaji.'
      },
      tier3: {
        q: 'Which agency is the statutory custodian and manager of the computerized cadastre and land title registry in the FCT?',
        options: [
          'Abuja Geographic Information Systems (AGIS)',
          'Federal Ministry of Solid Minerals',
          'Abuja Urban Mass Transport Company (AUMTCO)',
          'FCT Water Board Laboratory'
        ],
        ans: 0,
        ref: 'FCTA Establishment Order / AGIS Edict',
        exp: 'AGIS (Abuja Geographic Information Systems) manages the spatial data infrastructure, cadastre, and electronic land title records for FCTA.'
      },
      tier4: {
        q: 'What is the statutory role of the FCT Civil Service Commission established under the FCT-CSC Act?',
        options: [
          'To handle recruitment, career progression, promotion examinations, and discipline of all career civil servants in the FCTA',
          'To construct interstate railway lines across West Africa',
          'To print currency notes for the Central Bank',
          'To manage commercial fuel importation'
        ],
        ans: 0,
        ref: 'FCT Civil Service Commission Act 2018',
        exp: 'The FCT Civil Service Commission exercises autonomous constitutional powers to recruit, promote, deploy, and discipline career FCTA personnel.'
      }
    },
    {
      chapter: 'Abuja Master Plan & Infrastructure Management',
      tier1: {
        q: 'Which agency has the primary statutory mandate to demolish illegal structures and enforce compliance with the Abuja Master Plan?',
        options: [
          'Department of Development Control',
          'Abuja Markets Management Limited',
          'FCT Pilgrims Welfare Board',
          'FCT Sports Council'
        ],
        ans: 0,
        ref: 'FCT Development Control Regulations',
        exp: 'The Department of Development Control enforces land use compliance and removes structures that contravene the approved Abuja Master Plan.'
      },
      tier2: {
        q: 'Which consortium prepared the foundational Master Plan for the Federal Capital City of Nigeria in 1979?',
        options: [
          'International Planning Associates (IPA) along with Kenzo Tange & Urtec',
          'The London County Architectural Guild',
          'The Nigerian Institute of Surveyors Student Council',
          'The United Nations Maritime Commission'
        ],
        ans: 0,
        ref: 'Abuja Master Plan Historical Document 1979',
        exp: 'The Abuja Master Plan was designed by International Planning Associates (IPA) in conjunction with renowned Japanese architect Kenzo Tange.'
      },
      tier3: {
        q: 'Which board is statutorily tasked with domestic solid waste evacuation, sanitation enforcement, and pollution abatement in the FCT?',
        options: [
          'Abuja Environmental Protection Board (AEPB)',
          'Federal Road Safety Corps',
          'National Agency for Food and Drug Administration (NAFDAC)',
          'FCT Tourism Development Board'
        ],
        ans: 0,
        ref: 'AEPB Act No. 10 of 1997',
        exp: 'The Abuja Environmental Protection Board (AEPB) oversees municipal solid waste management, liquid waste treatment, and environmental health across the territory.'
      },
      tier4: {
        q: 'What is the strategic operational mandate of the Satellite Towns Development Department (STDD) under the FCTA?',
        options: [
          'To extend infrastructure, trunk roads, water networks, and socioeconomic amenities to the peri-urban and rural satellite towns of the FCT',
          'To launch space exploration satellites from Mount Patti',
          'To regulate private civil aviation flights at Nnamdi Azikiwe International Airport',
          'To administer military naval barracks'
        ],
        ans: 0,
        ref: 'STDD Mandate Charter & FCTA Governance Guide',
        exp: 'STDD is mandated to bridge the infrastructural gap between the Federal Capital City (FCC) and the surrounding satellite towns (Kubwa, Karu, Gwagwalada, etc.).'
      }
    }
  ];

  // Helper to push items
  let qId = 1000;

  // Compile PSR questions across 4 tiers
  psrTopics.forEach((topic) => {
    [1, 2, 3, 4].forEach((tier) => {
      const tierData = (topic as any)[`tier${tier}`];
      if (tierData) {
        const targetAns = (qId % 4);
        const rawQ: Question = {
          id: `q_psr_${qId++}`,
          subject: 'psr',
          chapterOrTopic: topic.chapter,
          difficultyTier: tier,
          questionText: tierData.q,
          optionA: tierData.options[0],
          optionB: tierData.options[1],
          optionC: tierData.options[2],
          optionD: tierData.options[3],
          correctOptionIndex: tierData.ans,
          explanation: tierData.exp,
          referenceDoc: tierData.ref,
          createdBy: 'system'
        };
        bank.push(shuffleQuestionOptions(rawQ, targetAns));
      }
    });
  });

  // Compile FR questions across 4 tiers
  frTopics.forEach((topic) => {
    [1, 2, 3, 4].forEach((tier) => {
      const tierData = (topic as any)[`tier${tier}`];
      if (tierData) {
        const targetAns = (qId % 4);
        const rawQ: Question = {
          id: `q_fr_${qId++}`,
          subject: 'fr',
          chapterOrTopic: topic.chapter,
          difficultyTier: tier,
          questionText: tierData.q,
          optionA: tierData.options[0],
          optionB: tierData.options[1],
          optionC: tierData.options[2],
          optionD: tierData.options[3],
          correctOptionIndex: tierData.ans,
          explanation: tierData.exp,
          referenceDoc: tierData.ref,
          createdBy: 'system'
        };
        bank.push(shuffleQuestionOptions(rawQ, targetAns));
      }
    });
  });

  // Compile PPA questions across 4 tiers
  ppaTopics.forEach((topic) => {
    [1, 2, 3, 4].forEach((tier) => {
      const tierData = (topic as any)[`tier${tier}`];
      if (tierData) {
        const targetAns = (qId % 4);
        const rawQ: Question = {
          id: `q_ppa_${qId++}`,
          subject: 'ppa',
          chapterOrTopic: topic.chapter,
          difficultyTier: tier,
          questionText: tierData.q,
          optionA: tierData.options[0],
          optionB: tierData.options[1],
          optionC: tierData.options[2],
          optionD: tierData.options[3],
          correctOptionIndex: tierData.ans,
          explanation: tierData.exp,
          referenceDoc: tierData.ref,
          createdBy: 'system'
        };
        bank.push(shuffleQuestionOptions(rawQ, targetAns));
      }
    });
  });

  // Compile FCTA General Knowledge questions across 4 tiers
  fctaTopics.forEach((topic) => {
    [1, 2, 3, 4].forEach((tier) => {
      const tierData = (topic as any)[`tier${tier}`];
      if (tierData) {
        const targetAns = (qId % 4);
        const rawQ: Question = {
          id: `q_fcta_${qId++}`,
          subject: 'fcta_gk',
          chapterOrTopic: topic.chapter,
          difficultyTier: tier,
          questionText: tierData.q,
          optionA: tierData.options[0],
          optionB: tierData.options[1],
          optionC: tierData.options[2],
          optionD: tierData.options[3],
          correctOptionIndex: tierData.ans,
          explanation: tierData.exp,
          referenceDoc: tierData.ref,
          createdBy: 'system'
        };
        bank.push(shuffleQuestionOptions(rawQ, targetAns));
      }
    });
  });

  // ==========================================
  // 5. ALL CADRES & PROFESSIONAL FIELDS QUESTIONS
  // ==========================================
  FCTA_CADRES.forEach((cadre) => {
    // Generate specialized questions for each tier of this cadre
    [1, 2, 3, 4].forEach((tier) => {
      let qText = '';
      let optA = '';
      let optB = '';
      let optC = '';
      let optD = '';
      let correctIdx = 0;
      let explanation = '';
      let refDoc = `${cadre.name} Professional Standard & Scheme of Service`;

      if (tier === 1) {
        qText = `In the ${cadre.name} cadre, what is the primary baseline duty expected of a junior officer?`;
        optA = `Accurate record keeping, prompt execution of assigned routine instructions, and adherence to departmental safety and operational ethics`;
        optB = `Negotiating international bilateral investment treaties without clearance`;
        optC = `Altering verified architectural and financial vouchers independently`;
        optD = `Declaring unilateral public work strikes without union mediation`;
        correctIdx = 0;
        explanation = `Junior cadre staff in the ${cadre.name} department focus on foundational duties, operational diligence, and statutory record preservation.`;
      } else if (tier === 2) {
        qText = `Under the Scheme of Service for ${cadre.name}s on GL 07 - 10, how should operational challenges or statutory non-compliance be escalated?`;
        optA = `By preparing a concise, evidence-grounded official memorandum to the Head of Section with recommended regulatory solutions`;
        optB = `By withholding official files until monetary compensation is received from clients`;
        optC = `By issuing unauthorized public statements to tabloid journalists`;
        optD = `By ignoring standard operating procedures until an audit query is served`;
        correctIdx = 0;
        explanation = `Officer II to Senior Officers must formulate analytical administrative memos adhering to established civil service reporting channels.`;
      } else if (tier === 3) {
        qText = `As a Principal or Chief ${cadre.name} (GL 12 - 14), what is your core responsibility during departmental policy review?`;
        optA = `Supervising operational teams, vetting complex professional reports, mentoring junior officers, and ensuring alignment with FCTA strategic objectives`;
        optB = `Delegating 100% of supervisory accountability to outside ad-hoc contractors`;
        optC = `Refusing to conduct annual APER appraisals for subordinate staff`;
        optD = `Approving expenditures that exceed approved budgetary lines`;
        correctIdx = 0;
        explanation = `Senior management cadre officers serve as supervisory technical anchors overseeing quality assurance, human resource development, and compliance.`;
      } else {
        qText = `At the Directorate level (GL 15 - 17) for ${cadre.name}, what strategic function is paramount in governance?`;
        optA = `Formulating visionary departmental policies, advising the Mandate Secretary, ensuring institutional transparency, and managing sector budgetary allocations`;
        optB = `Engaging in partisan political campaigns using official government vehicles`;
        optC = `Disregarding Public Procurement Act thresholds when issuing contracts`;
        optD = `Operating unrecorded bank accounts outside the Treasury Single Account`;
        correctIdx = 0;
        explanation = `Directors and Assistant Directors are policy drivers responsible for executive leadership, institutional sustainability, and statutory integrity.`;
      }

      const targetAns = (qId % 4);
      const rawQ: Question = {
        id: `q_cadre_${cadre.id}_t${tier}_${qId++}`,
        subject: 'cadre',
        cadre: cadre.name,
        chapterOrTopic: `${cadre.department} Scheme of Service (Tier ${tier})`,
        difficultyTier: tier,
        questionText: qText,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctOptionIndex: correctIdx,
        explanation: explanation,
        referenceDoc: refDoc,
        createdBy: 'system'
      };
      bank.push(shuffleQuestionOptions(rawQ, targetAns));
    });
  });

  return bank;
}

// Procedural bank expander to provide an unlimited bank of 1000+ realistic questions
export function getExpandedQuestionBank(baseBank: Question[]): Question[] {
  const bankMap = new Map<string, Question>();
  baseBank.forEach((q) => {
    if (q && q.id) bankMap.set(q.id, q);
  });
  let autoId = 5000;

  const psrSubtopics = [
    { sub: 'Confirmation of Appointment', rule: 'PSR 020302', desc: 'Officer must pass the prescribed civil service examination before confirmation' },
    { sub: 'Acting Appointments', rule: 'PSR 020601', desc: 'Acting appointments are made to meet pressing official exigencies not exceeding one year' },
    { sub: 'Secondment and Transfer', rule: 'PSR 020501', desc: 'Secondment period is normally two years, subject to renewal or permanent absorption' },
    { sub: 'Withholding of Increment', rule: 'PSR 030201', desc: 'Increment may be deferred or withheld on grounds of unsatisfactory service or adverse APER' },
    { sub: 'Dress Code & Decorum', rule: 'PSR 030419', desc: 'All civil servants must dress decently and professionally during official duty hours' },
    { sub: 'Public Statements & Media', rule: 'PSR 030421', desc: 'No officer may broadcast or publish official information without prior Ministerial authorization' },
    { sub: 'Code of Ethics', rule: 'PSR 030403', desc: 'Integrity, transparency, punctuality, and political neutrality constitute the bedrock of public service' },
    { sub: 'Study Leave with Pay', rule: 'PSR 140201', desc: 'Officers with confirmed status may be granted study leave with pay for certified national priority courses' },
    { sub: 'Paternity Leave', rule: 'PSR 100302', desc: 'Male officers are entitled to 14 working days of paternity leave upon childbirth of a legal spouse' },
    { sub: 'Compassionate Leave', rule: 'PSR 100401', desc: 'Officers may be granted compassionate leave of up to 14 days in circumstances of sudden personal bereavement' }
  ];

  const frSubtopics = [
    { sub: 'Capital vs Recurrent Budget', rule: 'FR Rule 202', desc: 'Funds allocated for capital developmental projects cannot be viremented to recurrent personnel overheads without National Assembly virement warrant' },
    { sub: 'Bank Reconciliation Statements', rule: 'FR Rule 705', desc: 'Monthly bank reconciliation statements must be compiled within seven days of the following month' },
    { sub: 'Loss of Public Stores', rule: 'FR Rule 1705', desc: 'Unaccounted store shortages must be investigated by a statutory Board of Survey' },
    { sub: 'Retention Money on Contracts', rule: 'FR Rule 1205', desc: 'A minimum 5% retention fee is withheld from interim certificates until defects liability expiration' },
    { sub: 'Audit Inspection Rights', rule: 'FR Rule 1902', desc: 'The Auditor-General for the Federation has unhindered access to all books, vouchers, records, and cash balances' },
    { sub: 'Revenue Receipt Books', rule: 'FR Rule 502', desc: 'Treasury Book 6A must be sequentially issued and safely kept in fire-resistant safes' },
    { sub: 'E-Payment Procedures', rule: 'FR Rule 710', desc: 'All disbursements must be routed via electronic banking platforms directly into vendor bank accounts' },
    { sub: 'Sub-Accounting Officer Duties', rule: 'FR Rule 110', desc: 'Sub-accounting officers are personally responsible for daily cashbook balances and physical checks' }
  ];

  const ppaSubtopics = [
    { sub: 'Bid Security / Tender Guarantee', rule: 'PPA Sec 26', desc: 'Bid security of not less than 2% of the bid price is mandatory for major procurement contracts' },
    { sub: 'Margin of Preference', rule: 'PPA Sec 34', desc: 'A margin of preference of up to 15% may be accorded to domestic manufactured goods and indigenous bidders' },
    { sub: 'Procurement Records Keeping', rule: 'PPA Sec 38', desc: 'All procurement documents, bids, evaluation sheets, and minutes must be securely archived for at least 10 years' },
    { sub: 'Debarment of Contractors', rule: 'PPA Sec 58', desc: 'Contractors found guilty of fraud, tax evasion, or document falsification are debarred from all public tenders' },
    { sub: 'Public Bid Opening Protocol', rule: 'PPA Sec 30', desc: 'Bids must be opened publicly immediately following the expiration of the deadline for submission in presence of bidders and civil society observers' },
    { sub: 'Procurement Planning Committee', rule: 'PPA Sec 18', desc: 'Every procuring entity must establish a Procurement Planning Committee chaired by the Accounting Officer' }
  ];

  const fctaSubtopics = [
    { sub: 'FCT Land Title Allocation', rule: 'Land Use Act 1978 & FCTA Edict', desc: 'Right of Occupancy (R of O) is granted under the statutory authority of the Minister of the FCT' },
    { sub: 'Abuja Green Belt Preservation', rule: 'Abuja Master Plan Regulation', desc: 'Encroachment upon floodplains, green verges, hills, and service corridors is strictly prohibited' },
    { sub: 'FCT Internal Revenue Service Act', rule: 'FCT-IRS Act 2015', desc: 'FCT-IRS is the sole statutory revenue authority for personal income tax collection in the FCT' },
    { sub: 'Area Council Budgets', rule: 'Area Council Financial Guidelines', desc: 'Area Councils must present annual appropriation bills to the FCTA Area Council Secretariat for statutory harmonization' },
    { sub: 'FCTA Transportation Master Plan', rule: 'FCT Directorate of Road Traffic', desc: 'Integration of Abuja Light Rail, bus rapid transit corridors, and computer-managed traffic light systems' }
  ];

  // Generate questions per subtopic across tiers 1 to 4
  [1, 2, 3, 4].forEach((tier) => {
    psrSubtopics.forEach((topic) => {
      const qId = autoId++;
      const q: Question = {
        id: `q_psr_gen_${qId}`,
        subject: 'psr',
        chapterOrTopic: `PSR Chapter ${tier + 2}: ${topic.sub}`,
        difficultyTier: tier,
        questionText: `Under Public Service Rules regarding "${topic.sub}", which statement accurately reflects civil service regulations for Grade Level officers?`,
        optionA: `${topic.desc}.`,
        optionB: `Officers can determine their own arbitrary procedures without reference to PSR provisions.`,
        optionC: `The rule was officially abolished in 1960 and no longer applies in Nigeria.`,
        optionD: `Only contract expatriate employees are bound by this administrative regulation.`,
        correctOptionIndex: 0,
        explanation: `${topic.rule} strictly stipulates: ${topic.desc}. Compliance is mandatory across all ministries and parastatals.`,
        referenceDoc: topic.rule,
        createdBy: 'system'
      };
      bankMap.set(q.id, shuffleQuestionOptions(q, qId % 4));
    });

    frSubtopics.forEach((topic) => {
      const qId = autoId++;
      const q: Question = {
        id: `q_fr_gen_${qId}`,
        subject: 'fr',
        chapterOrTopic: `FR Guidelines: ${topic.sub}`,
        difficultyTier: tier,
        questionText: `In Financial Regulations concerning "${topic.sub}", what is the statutory standard required of accounting officers?`,
        optionA: `${topic.desc}.`,
        optionB: `Expenditure can be authorized verbally without keeping written ledgers or audit trails.`,
        optionC: `Public funds can be kept in personal savings accounts to yield private interest.`,
        optionD: `Payments should be made without verifying if the goods or services were delivered.`,
        correctOptionIndex: 0,
        explanation: `${topic.rule} mandates: ${topic.desc}. Non-compliance constitutes grave financial malpractice subject to PAC investigation.`,
        referenceDoc: topic.rule,
        createdBy: 'system'
      };
      bankMap.set(q.id, shuffleQuestionOptions(q, qId % 4));
    });

    ppaSubtopics.forEach((topic) => {
      const qId = autoId++;
      const q: Question = {
        id: `q_ppa_gen_${qId}`,
        subject: 'ppa',
        chapterOrTopic: `PPA 2007: ${topic.sub}`,
        difficultyTier: tier,
        questionText: `According to the Public Procurement Act 2007 on "${topic.sub}", which requirement is mandatory?`,
        optionA: `${topic.desc}.`,
        optionB: `Contractors may pay kickbacks to procurement officers to accelerate tender approvals.`,
        optionC: `Procuring entities are exempted from keeping minutes of tender evaluation meetings.`,
        optionD: `Bids can be opened in secret behind closed doors without external observers.`,
        correctOptionIndex: 0,
        explanation: `${topic.rule} requires: ${topic.desc}. This guarantees transparency, accountability, and value for money.`,
        referenceDoc: topic.rule,
        createdBy: 'system'
      };
      bankMap.set(q.id, shuffleQuestionOptions(q, qId % 4));
    });

    fctaSubtopics.forEach((topic) => {
      const qId = autoId++;
      const q: Question = {
        id: `q_fcta_gen_${qId}`,
        subject: 'fcta_gk',
        chapterOrTopic: `FCTA Governance: ${topic.sub}`,
        difficultyTier: tier,
        questionText: `Within the Federal Capital Territory Administration governance structure, what is the legal position on "${topic.sub}"?`,
        optionA: `${topic.desc}.`,
        optionB: `The Federal Capital Territory operates without any codified urban planning or revenue laws.`,
        optionC: `Area Councils possess constitutional powers to alter the Kenzo Tange Abuja Master Plan at will.`,
        optionD: `Private developers can construct commercial plazas inside designated ecological river corridors.`,
        correctOptionIndex: 0,
        explanation: `${topic.rule} affirms: ${topic.desc}. Preserving the integrity of Abuja depends on strict enforcement.`,
        referenceDoc: topic.rule,
        createdBy: 'system'
      };
      bankMap.set(q.id, shuffleQuestionOptions(q, qId % 4));
    });

    // Also generate multiple questions for all cadres in each tier
    FCTA_CADRES.forEach((cadre) => {
      const qId = autoId++;
      const q: Question = {
        id: `q_cadre_${cadre.id}_exp_${tier}_${qId}`,
        subject: 'cadre',
        cadre: cadre.name,
        chapterOrTopic: `${cadre.name} Professional Best Practices`,
        difficultyTier: tier,
        questionText: `For officers in the ${cadre.name} cadre (${cadre.department}), which operational practice best demonstrates professional excellence at Tier ${tier}?`,
        optionA: `Upholding statutory schemes of service, prioritizing public interest, ensuring meticulous documentation, and applying standard professional codes.`,
        optionB: `Discarding official documentation once the current calendar month elapses.`,
        optionC: `Refusing to collaborate with inter-departmental technical committees.`,
        optionD: `Soliciting unauthorized gratuities before delivering scheduled public services.`,
        correctOptionIndex: 0,
        explanation: `In the ${cadre.name} cadre, adherence to Scheme of Service guidelines and civil service ethics is mandatory for promotion and evaluation.`,
        referenceDoc: `${cadre.secretariat} Operational Code`,
        createdBy: 'system'
      };
      bankMap.set(q.id, shuffleQuestionOptions(q, qId % 4));
    });
  });

  return Array.from(bankMap.values());
}
