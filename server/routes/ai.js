import { Router } from 'express'
import Groq from 'groq-sdk'
import multer from 'multer'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const router = Router()

const MODEL = 'llama-3.3-70b-versatile'

function getGroq() {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set in .env')
  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

// File upload — memory storage, 5MB max, PDF and TXT only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['application/pdf', 'text/plain'].includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only PDF and TXT files are supported'))
  },
})

// Parse a CV file → return extracted text
router.post('/parse-cv', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  try {
    let text
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer)
      text = data.text
    } else {
      text = req.file.buffer.toString('utf-8')
    }
    if (!text?.trim()) return res.status(400).json({ error: 'Could not extract text from file' })
    res.json({ text })
  } catch (err) {
    console.error('File parse error:', err)
    res.status(500).json({ error: 'Failed to read file: ' + err.message })
  }
})

async function ask(prompt) {
  const groq = getGroq()
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  })
  return response.choices[0].message.content.trim()
}

// CV / Resume Review
router.post('/cv-review', async (req, res) => {
  const { cvText } = req.body
  if (!cvText?.trim()) return res.status(400).json({ error: 'cvText is required' })

  try {
    const raw = await ask(`You are a senior recruiter and career coach with 15+ years hiring for top tech companies. Analyse this CV with brutal honesty and actionable precision.

Return a JSON object with EXACTLY this shape — no other text, no markdown, no code fences:
{
  "score": <integer 1-10>,
  "summary": "<2-3 sentence honest verdict: what kind of candidate this is, what role level they suit, and the single biggest thing holding them back>",
  "strengths": [
    "<specific strength WITH evidence from the CV — e.g. 'Quantified impact: mentions 40% performance improvement, which immediately signals results-oriented thinking to recruiters'>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "weaknesses": [
    "<specific weakness WITH explanation of recruiter impact — e.g. 'No measurable achievements in the last role: bullet points like 'responsible for X' without numbers get skipped by ATS and ignored by hiring managers'>",
    "<specific weakness 2>",
    "<specific weakness 3>"
  ],
  "suggestions": [
    {
      "line": "<exact phrase or bullet copied from the CV>",
      "suggestion": "<a ready-to-use rewrite of that exact line, stronger, quantified, and ATS-optimised — not generic advice, a real replacement they can paste in>"
    },
    { "line": "...", "suggestion": "..." },
    { "line": "...", "suggestion": "..." },
    { "line": "...", "suggestion": "..." },
    { "line": "...", "suggestion": "..." }
  ]
}

CV TO ANALYSE:
${cvText}`)
    const text = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('CV review error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Cover Letter Review
router.post('/cover-letter-review', async (req, res) => {
  const { coverLetter, jobDescription } = req.body
  if (!coverLetter?.trim() || !jobDescription?.trim()) {
    return res.status(400).json({ error: 'coverLetter and jobDescription are required' })
  }

  try {
    const raw = await ask(`You are an expert hiring manager and cover letter coach. Analyse this cover letter against the job description and return a JSON object with exactly this shape:
{
  "relevance_score": <integer 1-10>,
  "tone": "<e.g. Professional, Confident, Formal, Warm, Generic>",
  "missing": ["<missing element 1>", "<missing element 2>", "<missing element 3>"],
  "rewrites": [
    { "original": "<quoted phrase>", "rewrite": "<stronger version>", "reason": "<one sentence why>" },
    { "original": "...", "rewrite": "...", "reason": "..." },
    { "original": "...", "rewrite": "...", "reason": "..." }
  ]
}

Respond ONLY with the raw JSON object. No markdown, no code fences, no explanation.

JOB DESCRIPTION:
${jobDescription}

COVER LETTER:
${coverLetter}`)
    const text = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Cover letter error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Follow-up Email Generator
router.post('/follow-up', async (req, res) => {
  const { company, jobTitle, scenario } = req.body
  if (!company || !jobTitle || !scenario) {
    return res.status(400).json({ error: 'company, jobTitle, and scenario are required' })
  }

  const scenarioMap = {
    after_applying:      'following up after submitting the job application',
    after_interview:     'following up after a job interview',
    no_response_2_weeks: 'following up after 2 weeks of no response',
    decline_offer:       'politely declining a job offer',
  }

  try {
    const email = await ask(`Write a professional, warm, and concise follow-up email for a job seeker who is ${scenarioMap[scenario] || scenario}.

Company: ${company}
Job Title: ${jobTitle}

Requirements:
- 3–4 short paragraphs maximum
- Warm but professional tone
- Personalised with the company and role name
- First line must be the subject line formatted as: Subject: ...
- Ready to send with minimal editing
- Do not use [placeholder] brackets

Return ONLY the email text (subject line then body). No commentary, no markdown.`)
    res.json({ email })
  } catch (err) {
    console.error('Follow-up error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Interview Prep
router.post('/interview-prep', async (req, res) => {
  const { jobDescription, candidateContext } = req.body
  if (!jobDescription?.trim()) return res.status(400).json({ error: 'jobDescription is required' })

  try {
    const raw = await ask(`You are an elite interview coach who has prepared hundreds of candidates for FAANG and top-tier companies. Your job is to predict the exact questions this interviewer will ask and give model answers tailored to this specific role.

Analyse the job description and return a JSON object with EXACTLY this shape — no other text, no markdown, no code fences:
{
  "role": "<inferred job title>",
  "company_type": "<Startup / Scale-up / Enterprise — inferred from JD>",
  "difficulty": "<Junior / Mid-level / Senior / Staff — inferred from requirements>",
  "categories": [
    {
      "name": "Behavioral",
      "icon": "users",
      "description": "Past situations that reveal how you work",
      "questions": [
        {
          "q": "<specific interview question>",
          "why": "<one sentence insider tip: the real thing the interviewer is testing — be specific and tactical>",
          "answer": "<a strong, ready-to-use model answer (4-6 sentences) written in first person, STAR format where relevant, references specific skills/tools from the JD, concrete and un-generic>"
        }
      ]
    },
    {
      "name": "Technical",
      "icon": "code",
      "description": "Hard skills and role-specific knowledge",
      "questions": [
        { "q": "...", "why": "...", "answer": "..." },
        { "q": "...", "why": "...", "answer": "..." },
        { "q": "...", "why": "...", "answer": "..." }
      ]
    },
    {
      "name": "Motivation",
      "icon": "target",
      "description": "Why you, why this role, why this company",
      "questions": [
        { "q": "...", "why": "...", "answer": "..." },
        { "q": "...", "why": "...", "answer": "..." },
        { "q": "...", "why": "...", "answer": "..." }
      ]
    },
    {
      "name": "Situational",
      "icon": "lightbulb",
      "description": "Hypothetical scenarios to test your judgement",
      "questions": [
        { "q": "...", "why": "...", "answer": "..." },
        { "q": "...", "why": "...", "answer": "..." },
        { "q": "...", "why": "...", "answer": "..." }
      ]
    }
  ]
}

Critical rules:
- Exactly 4 questions per category (16 total)
- Every question MUST be tailored to the specific role, team, and tech stack in the JD — never generic
- Model answers must reference actual technologies, skills, and requirements from the JD
- The "why" must be an insider tip that would make a candidate think "I never would have guessed that"
- Answers should be confident and specific, not hedge-filled
- Do not repeat the question in the answer

${candidateContext ? `Candidate context to personalise answers: ${candidateContext}` : ''}

JOB DESCRIPTION:
${jobDescription}`)

    const text = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Interview prep error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Salary Intelligence
router.post('/salary-intelligence', async (req, res) => {
  const { jobTitle, location, experienceLevel } = req.body
  if (!jobTitle?.trim()) return res.status(400).json({ error: 'jobTitle is required' })

  const expMap = {
    entry:  'Entry Level (0–2 years experience)',
    mid:    'Mid Level (3–5 years experience)',
    senior: 'Senior (6–10 years experience)',
    staff:  'Staff / Lead (10+ years experience)',
  }
  const expLabel = expMap[experienceLevel] || expMap.mid

  try {
    const raw = await ask(`You are a compensation analyst with access to salary databases (Glassdoor, Levels.fyi, LinkedIn Salary, Payscale, and government labour statistics). Provide a detailed, accurate salary intelligence report for the following role.

Role: ${jobTitle}
Location: ${location || 'Global / Remote'}
Experience Level: ${expLabel}

Return a JSON object with EXACTLY this shape — no other text, no markdown, no code fences:
{
  "role": "<cleaned job title>",
  "location_label": "<city/region or 'Global / Remote'>",
  "currency": "<$ or £ or € depending on location>",
  "p25": <integer annual salary at 25th percentile>,
  "median": <integer annual salary at median>,
  "p75": <integer annual salary at 75th percentile>,
  "p90": <integer annual salary at 90th percentile>,
  "yoy_change": <integer percentage year-over-year change, e.g. 5 for +5% or -3 for -3%>,
  "remote_delta": "<e.g. '+8% vs. on-site average' or '-5% vs. office roles'>",
  "open_roles_estimate": "<e.g. 'Very High (10,000+ openings)' or 'Moderate'>",
  "demand_level": "<one of: Very High / High / Moderate / Low>",
  "market_verdict": "<one of: High Demand / Growing / Stable / Declining / Oversaturated>",
  "market_summary": "<3-4 sentences explaining the current market reality for this role: supply/demand, key industries hiring, how AI/automation is impacting it, what makes top earners stand out>",
  "top_companies": [
    { "name": "<company name>", "range": "<e.g. $120k–$180k>", "type": "<Remote / Hybrid / On-site>" },
    { "name": "...", "range": "...", "type": "..." },
    { "name": "...", "range": "...", "type": "..." },
    { "name": "...", "range": "...", "type": "..." },
    { "name": "...", "range": "...", "type": "..." }
  ],
  "skills_premium": [
    { "skill": "<high-value skill for this role>", "delta": "<e.g. 15% or $12k>" },
    { "skill": "...", "delta": "..." },
    { "skill": "...", "delta": "..." },
    { "skill": "...", "delta": "..." },
    { "skill": "...", "delta": "..." }
  ],
  "negotiation_tips": [
    "<specific, tactical negotiation tip tailored to this exact role and level>",
    "<tip 2>",
    "<tip 3>",
    "<tip 4>"
  ]
}

Critical rules:
- All salary figures must be realistic annual base salaries for the specific location and experience level
- If location is US, use $ and US market rates. If UK, use £. If EU, use €. If global/remote, use $ and note it
- The p90 figure should represent top-of-market (FAANG, top startups, finance) NOT outliers
- Top companies should be real, well-known employers who genuinely pay well for this role
- Skills premium should be specific technologies or certifications that truly move the needle for salary
- Negotiation tips must be tactical and role-specific, not generic ("know your worth" is not acceptable)
- market_summary should mention the CURRENT year context (2025–2026) and be honest about market conditions`)

    const text = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Salary intelligence error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Market Analysis
router.post('/market-analysis', async (req, res) => {
  const { currentRole, yearsExperience, targetGoal, appContext } = req.body
  if (!currentRole?.trim()) return res.status(400).json({ error: 'currentRole is required' })

  const appContext_str = appContext
    ? `User's tracked job application data (use this to personalise the analysis):
- Roles applied to: ${appContext.titles?.join(', ') || 'N/A'}
- Salary ranges seen: ${appContext.salaries?.join(', ') || 'N/A'}
- Companies applied to: ${appContext.companies?.join(', ') || 'N/A'}
- Total applications: ${appContext.total}, Interviews: ${appContext.interviews}, Offers: ${appContext.offers}
- Interview rate: ${appContext.total > 0 ? Math.round((appContext.interviews / appContext.total) * 100) : 0}%`
    : ''

  try {
    const raw = await ask(`You are a senior career strategist and labour market analyst with deep knowledge of 2025–2026 job market trends, compensation data, and career development paths. Produce a comprehensive, honest, and actionable market analysis report.

Current Role: ${currentRole}
Years of Experience: ${yearsExperience}
User's Goal: ${targetGoal || 'Not specified — infer from context'}
${appContext_str}

Return a JSON object with EXACTLY this shape — no other text, no markdown, no code fences:
{
  "health_check": {
    "role": "<cleaned job title>",
    "demand_score": <integer 1–10 representing market demand for this exact role right now>,
    "market_status": "<one of: Hot / Growing / Stable / Declining / Shrinking>",
    "salary_ceiling": "<realistic top-of-market annual salary, e.g. '$180k' or '£120k'>",
    "summary": "<3–4 sentences: honest market reality for this role in 2025–2026. Which sectors are growing vs cutting. What types of companies pay best. What makes the top 10% different from the average>",
    "top_industries": ["<industry 1>", "<industry 2>", "<industry 3>", "<industry 4>"],
    "ai_impact": "<2–3 sentences: specifically how AI and automation are affecting this role — which tasks are being automated, which are becoming MORE valuable, and what this means for job security and required skills in the next 2–3 years>",
    "warning": "<if there is a genuine concern (declining demand, saturation, structural shift), state it bluntly in 1–2 sentences. If market is healthy, set this to null>"
  },
  "skills_gap": {
    "target_role": "<the role they should be aiming for given their experience and goal>",
    "quick_win": "<1–2 sentences: the single most impactful skill to learn FIRST — the one that unlocks salary jumps, new opportunities, or bridges the biggest gap. Be specific about the skill AND why it's the keystone>",
    "gap_skills": [
      {
        "skill": "<specific skill, tool, or certification>",
        "priority": 1,
        "pay_delta": "<realistic salary increase, e.g. '+$12k' or '+18%'>",
        "time_to_learn": "<realistic time estimate, e.g. '4–6 weeks' or '3 months'>",
        "demand": "<Very High / High / Moderate>",
        "why": "<1 sentence: why this specific skill pays off for THIS role, not a generic reason>"
      },
      { "skill": "...", "priority": 2, "pay_delta": "...", "time_to_learn": "...", "demand": "...", "why": "..." },
      { "skill": "...", "priority": 3, "pay_delta": "...", "time_to_learn": "...", "demand": "...", "why": "..." },
      { "skill": "...", "priority": 4, "pay_delta": "...", "time_to_learn": "...", "demand": "...", "why": "..." },
      { "skill": "...", "priority": 5, "pay_delta": "...", "time_to_learn": "...", "demand": "...", "why": "..." }
    ]
  },
  "career_paths": {
    "paths": [
      {
        "type": "Safe",
        "role": "<the logical next-step role title>",
        "timeline": "<realistic timeframe, e.g. '6–12 months'>",
        "salary_jump": "<expected salary increase, e.g. '+20–30%'>",
        "difficulty": "Low",
        "description": "<2–3 sentences: why this is the safe path, what it involves, and who it's best for>",
        "steps": [
          "<concrete step 1 — specific action, not vague advice>",
          "<concrete step 2>",
          "<concrete step 3>",
          "<concrete step 4>"
        ],
        "work_style": "<what work/life looks like on this path, e.g. 'Remote-friendly · Stable hours · Less pressure than senior IC roles'>"
      },
      {
        "type": "Fast",
        "role": "<adjacent hot role that leverages their existing skills>",
        "timeline": "<e.g. '8–14 months'>",
        "salary_jump": "<e.g. '+35–50%'>",
        "difficulty": "Medium",
        "description": "<2–3 sentences: the pivot this requires, what's transferable, and why the salary jump is worth it. Be specific about what adjacent skills they already have that make this viable>",
        "steps": ["...", "...", "...", "..."],
        "work_style": "<e.g. 'High remote availability · Intense but short project cycles'>"
      },
      {
        "type": "Bold",
        "role": "<ambitious longer-term target — a different level or function>",
        "timeline": "<e.g. '2–3 years'>",
        "salary_jump": "<e.g. '+60–100%'>",
        "difficulty": "High",
        "description": "<2–3 sentences: what makes this bold, what sacrifices it requires, and what the payoff looks like. Be honest about the difficulty — don't just hype it>",
        "steps": ["...", "...", "...", "..."],
        "work_style": "<e.g. 'High pressure · Equity potential · Often requires relocation or company switch'>"
      }
    ]
  }
}

Critical rules:
- Everything must be SPECIFIC to this exact role and experience level — no generic career advice
- Salary figures must be realistic for the role and current market (not aspirational)
- The Fast path must be a genuine lateral pivot that someone with their background could make — not a fantasy
- The Bold path must be achievable in the stated timeline with extreme effort — not impossible
- Skills gap should reflect what hiring managers actually look for in job descriptions TODAY, not 3 years ago
- If the user's app context shows a low interview rate, acknowledge it tactfully in the health check or skills gap
- All 4 steps per path must be concrete actions (e.g. 'Complete AWS Solutions Architect cert' not 'Learn cloud')
- work_style should specifically address remote availability and working hours where relevant to the role`)

    const text = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Market analysis error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Company Research Brief
router.post('/company-research', async (req, res) => {
  const { companyName, jobTitle } = req.body
  if (!companyName?.trim()) return res.status(400).json({ error: 'companyName is required' })

  try {
    const raw = await ask(`You are a senior corporate intelligence analyst. A job candidate is about to interview at a company and needs a fast, accurate briefing — the kind a recruiter or headhunter would prepare. Research the following company and return everything they need to walk in prepared.

Company: ${companyName}
Role they applied for: ${jobTitle || 'Not specified'}

Return a JSON object with EXACTLY this shape — no other text, no markdown, no code fences:
{
  "company": "<cleaned official company name>",
  "tagline": "<what the company actually does in one sharp sentence>",
  "founded": "<year>",
  "headquarters": "<city, country>",
  "stage": "<one of: Pre-seed / Seed / Series A / Series B / Series C / Series D+ / Public / Bootstrapped / PE-backed>",
  "total_funding": "<e.g. '$240M' or 'Publicly traded (NASDAQ: XXXX)' or 'Undisclosed'>",
  "last_round": "<e.g. 'Series B · $80M · March 2024' or null>",
  "headcount": "<approximate employee count, e.g. '800–1,000'>",
  "headcount_trend": "<one of: Rapid growth / Steady growth / Flat / Layoffs reported / Significant layoffs>",
  "headcount_note": "<1 sentence: context on the trend>",
  "business_model": "<one of: SaaS / Marketplace / E-commerce / Enterprise / Consumer / Agency / Hardware / Fintech / Other>",
  "key_products": ["<product 1>", "<product 2>", "<product 3>"],
  "main_competitors": ["<competitor 1>", "<competitor 2>", "<competitor 3>"],
  "competitive_edge": "<what genuinely sets this company apart — be specific, not marketing speak>",
  "glassdoor_sentiment": "<one of: Very Positive / Positive / Mixed / Negative / Very Negative / No data>",
  "glassdoor_score": "<e.g. '3.8/5' or 'N/A'>",
  "culture_summary": "<3–4 sentences: what it's actually like to work there — pace, management style, remote policy, what employees praise and what they complain about. Be honest, not promotional>",
  "interview_culture": "<2–3 sentences: what the interview process is typically like — number of rounds, style (technical/behavioural/case), how fast they move, any known quirks or red flags>",
  "recent_news": [
    { "headline": "<news item 1 — product launch, funding, acquisition, layoff, partnership>", "date": "<approximate date or 'Recent'>", "sentiment": "<Positive / Neutral / Negative>" },
    { "headline": "<news item 2>", "date": "...", "sentiment": "..." },
    { "headline": "<news item 3>", "date": "...", "sentiment": "..." }
  ],
  "financial_health": "<one of: Strong / Healthy / Uncertain / Struggling / Unknown>",
  "financial_note": "<1–2 sentences: honest take on their financial position — burn rate concerns, path to profitability, recent revenue milestones, or why it's unclear>",
  "red_flags": ["<genuine concern if any — layoffs, leadership churn, funding drought, bad press>"],
  "green_flags": ["<genuine positive signal — strong growth, top-tier investors, market leadership>", "<signal 2>", "<signal 3>"],
  "role_fit_note": "<2–3 sentences specifically about what this company looks for in a ${jobTitle || 'candidate'} — what skills they emphasise, what type of person thrives there, and one thing the candidate should specifically prepare to discuss>",
  "talk_about": [
    "<specific thing to bring up — e.g. 'Their recent Series C and expansion into APAC — shows you follow their growth'>",
    "<thing 2 — specific and current, not generic>",
    "<thing 3>"
  ],
  "avoid": [
    "<thing to handle carefully — e.g. 'The 2024 layoffs — don't bring up unless asked, but have a thoughtful response ready'>",
    "<thing 2 if relevant, otherwise use null>"
  ]
}

Critical rules:
- Be honest about red flags — candidates need to know before they join, not after
- culture_summary must reflect real employee sentiment, not the company's own marketing copy
- interview_culture should include realistic round counts and known process quirks
- talk_about items must be specific and current — 'show enthusiasm' is not acceptable
- If you lack reliable data on a field, say 'Limited public data' rather than fabricating
- financial_health and headcount_trend are the two most decision-critical fields — be accurate
- role_fit_note must be tailored to ${jobTitle || 'the specific role'} at this exact company`)

    const text = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Company research error:', err)
    res.status(500).json({ error: err.message })
  }
})

// LinkedIn Profile Reviewer
router.post('/linkedin-review', async (req, res) => {
  const { headline, about, targetRole } = req.body
  if (!headline?.trim() && !about?.trim()) {
    return res.status(400).json({ error: 'Provide at least a headline or About section' })
  }

  try {
    const raw = await ask(`You are a senior LinkedIn optimisation specialist and recruiter with 10+ years of experience hiring across tech, finance, and consulting. You know exactly how LinkedIn's search algorithm works and what makes a recruiter stop scrolling.

Analyse this LinkedIn profile and return a full optimisation report.

Current Headline: ${headline || 'Not provided'}
About Section: ${about || 'Not provided'}
Target Role/Industry: ${targetRole || 'Not specified — infer from the profile content'}

Return a JSON object with EXACTLY this shape — no other text, no markdown, no code fences:
{
  "visibility_score": <integer 0–100 representing how likely this profile is to appear in recruiter searches — be honest and rigorous>,
  "visibility_verdict": "<2–3 sentences: what's holding the score back and what it would take to reach 80+>",
  "headline_score": <integer 0–100>,
  "headline_issues": [
    "<specific issue with the current headline — e.g. 'No keywords: recruiters search by skill, not job title alone'>",
    "<issue 2 if any>",
    "<issue 3 if any>"
  ],
  "headline_rewrites": [
    {
      "text": "<rewritten headline option 1 — the best one, keyword-rich, under 220 chars, includes role + top skills + value prop>",
      "reasoning": "<1 sentence: why this version outperforms the current one>"
    },
    {
      "text": "<option 2 — different angle, e.g. results-focused or industry-specific>",
      "reasoning": "<why>"
    },
    {
      "text": "<option 3 — more concise version>",
      "reasoning": "<why>"
    }
  ],
  "about_score": <integer 0–100 or null if no about was provided>,
  "about_feedback": [
    { "type": "good",    "text": "<something the About section does well>" },
    { "type": "bad",     "text": "<a specific weakness — missing hook, no metrics, passive voice, etc.>" },
    { "type": "bad",     "text": "<another weakness>" },
    { "type": "suggest", "text": "<a specific improvement suggestion>" },
    { "type": "suggest", "text": "<another suggestion>" }
  ],
  "about_rewrite": "<full rewritten About section — starts with a strong hook, uses active voice, includes 2–3 quantified achievements, ends with a clear call to action or open-to-work signal. Match the tone of the original but elevate it significantly. Max 2,600 characters>",
  "missing_keywords": [
    "<keyword recruiters search for that's absent from both headline and about — specific skills, tools, certifications, or job titles>",
    "<keyword 2>",
    "<keyword 3>",
    "<keyword 4>",
    "<keyword 5>",
    "<keyword 6>"
  ],
  "keywords_present": [
    "<keyword already present in the profile that's valuable for recruiter search>",
    "<keyword 2>",
    "<keyword 3>"
  ],
  "quick_wins": [
    "<highest-impact fix that takes under 5 minutes — be specific, e.g. 'Add Python, SQL, and Tableau to your Skills section to appear in 3x more searches'>",
    "<quick win 2>",
    "<quick win 3>",
    "<quick win 4>",
    "<quick win 5>"
  ],
  "profile_checklist": [
    { "label": "Professional headshot",            "done": <true/false based on what you can infer>, "impact": "21x more views" },
    { "label": "Custom banner image",              "done": false, "impact": "Brand signal" },
    { "label": "Headline optimised",               "done": <true if current headline is strong>, "impact": "40% more clicks" },
    { "label": "About section written",            "done": <true if about was provided and has content>, "impact": "High" },
    { "label": "Featured section used",            "done": false, "impact": "Showcases work" },
    { "label": "5+ experience entries",            "done": null, "impact": "Completeness" },
    { "label": "Skills section populated",         "done": null, "impact": "Keyword ranking" },
    { "label": "500+ connections",                 "done": null, "impact": "Algorithm boost" },
    { "label": "Open to Work enabled",             "done": null, "impact": "4x more recruiter views" },
    { "label": "Education section complete",       "done": null, "impact": "Completeness" },
    { "label": "Recommendations received",         "done": null, "impact": "Trust signal" },
    { "label": "Regular activity / posting",       "done": null, "impact": "SSI score" }
  ]
}

Critical rules:
- visibility_score must be brutally honest — most profiles score 25–50, only truly optimised ones reach 75+
- headline_rewrites must be immediately usable, not templates with [BRACKETS] to fill in
- about_rewrite must be a complete, polished, copy-pasteable section — not a draft with placeholders
- missing_keywords must be role-specific and based on what recruiters actually search in LinkedIn Recruiter
- quick_wins must be concrete actions, not generic advice like 'optimise your profile'
- For profile_checklist items where you cannot know (connections count, etc.), set done to null — this renders as 'unknown'
- Infer target role from the profile content if not specified`)

    const text = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('LinkedIn review error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Negotiation Simulator — chat turn
router.post('/negotiate', async (req, res) => {
  const { messages, context } = req.body
  if (!context?.company || !context?.jobTitle || !context?.offerAmount || !context?.targetAmount) {
    return res.status(400).json({ error: 'context with company, jobTitle, offerAmount, targetAmount is required' })
  }
  try {
    const groq = getGroq()
    const system = `You are a recruiter at ${context.company} hiring for a ${context.jobTitle} position. You have extended an offer of ${context.offerAmount}.

Your role is to simulate a realistic salary negotiation conversation. Follow these rules strictly:
- Stay in character as a professional recruiter at all times. Never break character.
- Start by presenting the offer warmly but firmly.
- Use realistic recruiter tactics: reference budget constraints, mention equity or benefits as alternatives, bring up "what HR has approved", compare to team benchmarks.
- Do NOT cave immediately. Hold firm for at least 2 rounds before showing any flexibility.
- You can move up maximum 12-15% from the initial offer across the whole conversation — no more.
- If the candidate asks for more than 20% above the offer, express surprise and push back firmly.
- Keep each response to 2-4 sentences max — this is a conversation, not an essay.
- Be warm, professional, and human. Not robotic.
- If the candidate is aggressive or rude, stay calm but become slightly cooler in tone.
- If a deal is agreed, say so clearly and congratulate them.
- The candidate's experience level is: ${context.experienceLevel || 'Mid-level'}.`

    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: 0.7,
      max_tokens: 300,
    })
    res.json({ reply: response.choices[0].message.content.trim() })
  } catch (err) {
    console.error('Negotiate error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Negotiation Simulator — score the full conversation
router.post('/negotiate/score', async (req, res) => {
  const { messages, context } = req.body
  if (!messages?.length || !context) return res.status(400).json({ error: 'messages and context required' })
  try {
    const transcript = messages.map(m => `${m.role === 'user' ? 'CANDIDATE' : 'RECRUITER'}: ${m.content}`).join('\n')
    const raw = await ask(`You are an expert salary negotiation coach. Analyse this negotiation conversation and score the candidate's performance.

Context:
- Company: ${context.company}
- Role: ${context.jobTitle}
- Initial offer: ${context.offerAmount}
- Candidate's target: ${context.targetAmount}
- Experience level: ${context.experienceLevel}

Transcript:
${transcript}

Return a JSON object with EXACTLY this shape — no other text, no markdown, no code fences:
{
  "score": <integer 0-100>,
  "verdict": "<one of: Excellent / Strong / Good / Needs Work / Weak>",
  "final_outcome": "<what was the final outcome — deal reached at X, no deal, still in progress, etc.>",
  "strengths": [
    "<specific thing the candidate did well with an example from the conversation>",
    "<strength 2>",
    "<strength 3>"
  ],
  "improvements": [
    {
      "what": "<specific thing they did wrong or missed>",
      "instead": "<exactly what they should have said or done — be specific and tactical>"
    },
    { "what": "...", "instead": "..." },
    { "what": "...", "instead": "..." }
  ],
  "script": "<A ready-to-use negotiation script they can use in a real conversation for this exact role and company. Write it as a flowing message/email they could send or say. 150-200 words. Professional, confident, specific to their situation. Start with acknowledging the offer, then make the ask, then back it up with 2 specific reasons, then close.>"
}`)
    const text = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Negotiate score error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/interview — single chat turn (AI interviewer responds)
router.post('/interview', async (req, res) => {
  const { messages, context } = req.body
  // context: { jobTitle, company, interviewType, difficulty, totalQuestions, experienceLevel }
  const groq = getGroq()
  try {
    const system = `You are a senior hiring manager at ${context.company || 'a leading company'} conducting a real job interview for a ${context.jobTitle} position.

INTERVIEW STRUCTURE:
- This is a ${context.interviewType} interview, ${context.difficulty === 'tough' ? 'challenging and rigorous' : 'professional and fair'}
- The candidate has ${context.experienceLevel} experience level — calibrate question difficulty accordingly
- Ask ONE question at a time — never multiple questions in one message
- Start with a warm professional greeting and one easy opener
- Follow up naturally based on their answer — dig deeper, ask for specifics, challenge vague answers
- Mix question types appropriate for a ${context.interviewType} interview
- After exactly ${context.totalQuestions} questions have been asked, end the interview by saying EXACTLY this phrase and nothing else: "That's all the questions I have for you today. Thank you for your time."

BEHAVIOURAL RULES:
- Stay in character as the interviewer the entire time — never break character
- If their answer is too short or vague, push back: "Could you be more specific?" or "Can you walk me through a concrete example?"
- Never give feedback, scores, hints, or encouragement during the interview
- Never acknowledge you are an AI
- Keep your messages short — 1 to 3 sentences max, like a real interviewer would
- TONE: Professional, neutral, slightly formal`

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 200,
    })
    res.json({ message: completion.choices[0].message.content.trim() })
  } catch (err) {
    console.error('Interview error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/interview/score — full scorecard after interview ends
router.post('/interview/score', async (req, res) => {
  const { messages, context } = req.body
  const groq = getGroq()
  try {
    const transcript = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'user' ? 'CANDIDATE' : 'INTERVIEWER'}: ${m.content}`)
      .join('\n\n')

    const prompt = `You were just the interviewer in a mock ${context.interviewType} interview for a ${context.jobTitle} role at ${context.company || 'a company'}.

Here is the full interview transcript:
${transcript}

Now step out of character and analyse the CANDIDATE'S performance as an expert career coach.

Return a JSON object with exactly this structure:
{
  "overallScore": <number 0-100>,
  "verdict": "<one punchy sentence — e.g. Strong communicator, needs sharper examples>",
  "breakdown": {
    "clarity":    { "score": <0-100>, "comment": "<1 sentence>" },
    "structure":  { "score": <0-100>, "comment": "<1 sentence — did they use STAR method?>" },
    "confidence": { "score": <0-100>, "comment": "<1 sentence>" },
    "relevance":  { "score": <0-100>, "comment": "<1 sentence — did answers match the role?>" },
    "depth":      { "score": <0-100>, "comment": "<1 sentence — specific examples vs vague?>" }
  },
  "strengths": ["<specific thing they did well>", "<another strength>"],
  "improvements": [
    { "issue": "<what went wrong>", "fix": "<concrete advice>", "example": "<how they should have answered>" }
  ],
  "standoutMoment": "<the single best thing they said, quoted or paraphrased>",
  "redFlag": "<the single biggest weakness, or null if none>"
}

Return ONLY valid JSON. No explanation, no markdown fences.`

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1200,
    })
    const raw = completion.choices[0].message.content.trim()
    const text = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Interview score error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/build-cv
router.post('/build-cv', async (req, res) => {
  const { personal, experience, education, skills, extras } = req.body
  try {
    const groq = getGroq()

    const expBlock = (experience || []).map((e, i) => `
Experience ${i + 1}:
  Company: ${e.company}
  Title: ${e.title}
  Start: ${e.start} | End: ${e.end || 'Present'}
  Location: ${e.location || ''}
  Bullets (raw): ${(e.bullets || []).join(' | ')}
`).join('\n')

    const eduBlock = (education || []).map((e, i) => `
Education ${i + 1}:
  Institution: ${e.institution}
  Degree: ${e.degree}
  Field: ${e.field || ''}
  Graduation: ${e.graduation}
  GPA: ${e.gpa || 'N/A'}
  Achievements: ${e.achievements || ''}
`).join('\n')

    const prompt = `You are an expert CV writer who specialises in ATS-optimised, recruiter-approved CVs that consistently land interviews at top companies.

Using the candidate information below, write a complete, polished, professional CV.

RULES:
- Use a clean reverse-chronological format
- Start with a punchy 2-3 sentence Professional Summary tailored to their target role
- For each work experience, write 3-5 strong bullet points starting with powerful action verbs (Led, Built, Drove, Reduced, Increased, Spearheaded, etc.)
- Quantify achievements wherever possible — infer reasonable numbers if the candidate hasn't provided them (e.g. "Reduced deployment time by ~40%")
- Skills section: split into Technical Skills and Soft Skills, formatted as a clean comma-separated list
- Education: include relevant coursework or achievements only if provided
- Keep language tight, confident, professional — no fluff
- Output ONLY the CV text — no commentary, no markdown code fences, no "Here is your CV:" preamble
- Format sections with clear ALL-CAPS headers followed by a line of dashes, like:
  PROFESSIONAL SUMMARY
  ─────────────────────
- Use two-space indent for bullet points under experience

CANDIDATE INFO:
Name: ${personal.firstName} ${personal.lastName}
Email: ${personal.email}
Phone: ${personal.phone || ''}
Location: ${personal.location || ''}
LinkedIn: ${personal.linkedin || ''}
Portfolio/Website: ${personal.website || ''}
Target Role: ${extras?.targetRole || 'Not specified'}
Years of Experience: ${extras?.yearsExp || 'Not specified'}

${expBlock}

${eduBlock}

Hard Skills: ${(skills?.hard || []).join(', ')}
Soft Skills: ${(skills?.soft || []).join(', ')}
Languages: ${(skills?.languages || []).join(', ')}
Certifications: ${(skills?.certifications || []).join(', ')}
Extra notes / achievements: ${extras?.notes || ''}
`

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 2000,
    })

    res.json({ cv: completion.choices[0].message.content.trim() })
  } catch (err) {
    console.error('CV build error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/compare-offers
router.post('/compare-offers', async (req, res) => {
  const { offers, careerGoal, yearsExp, location } = req.body
  try {
    const groq = getGroq()

    const prompt = `You are a career strategist and compensation expert helping a candidate objectively compare job offers.

Here are the offers to compare:
${JSON.stringify(offers, null, 2)}

Candidate context:
- Location: ${location || 'Not specified'}
- Career goal: ${careerGoal}
- Years of experience: ${yearsExp || 'Not specified'}

Analyse every offer across these dimensions and return a JSON object with exactly this structure:
{
  "winner": "<company name of the overall best offer>",
  "winnerReason": "<1-2 sentence explanation of why it wins overall>",
  "offers": [
    {
      "company": "<name>",
      "totalCompScore": <0-100>,
      "totalComp": "<calculated total annual compensation as a readable string e.g. $142,000–$155,000>",
      "scores": {
        "compensation": { "score": <0-100>, "comment": "<1 sentence>" },
        "growth":       { "score": <0-100>, "comment": "<1 sentence — career trajectory, company trajectory>" },
        "workLife":     { "score": <0-100>, "comment": "<1 sentence — remote policy, commute, company size>" },
        "stability":    { "score": <0-100>, "comment": "<1 sentence — company size, industry, funding>" },
        "benefits":     { "score": <0-100>, "comment": "<1 sentence>" }
      },
      "pros": ["<specific pro>", "<specific pro>", "<specific pro>"],
      "cons": ["<specific con>", "<specific con>"],
      "watchOut": "<one hidden risk or overlooked detail, or null>",
      "negotiationTip": "<one specific thing they could push back on to improve this offer>"
    }
  ],
  "headToHead": [
    { "category": "<category>", "winner": "<company name>", "reason": "<1 sentence why>" }
  ],
  "verdict": "<2-3 sentence honest bottom-line recommendation tailored to their career goal>"
}

Be brutally honest. Factor in total comp (base + bonus + equity). Account for cost of living if locations differ. Weight your analysis toward the stated career goal.
Return ONLY valid JSON. No explanation, no markdown fences.`

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const raw = completion.choices[0].message.content.trim()
    const text = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Compare offers error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/pitch — KPMG-style business pitch analysis
router.post('/pitch', async (req, res) => {
  const { pitch, industry, stage, fundingAsk, targetMarket } = req.body
  if (!pitch?.trim()) return res.status(400).json({ error: 'Pitch content is required' })

  const groq = getGroq()
  const prompt = `You are a Senior Partner in KPMG's Deal Advisory & Strategy practice with 20 years of experience evaluating early-stage businesses, Series A startups, and growth companies. You have assessed over 400 business plans and sat on 3 investment committees.

Analyse this business pitch with the same rigorous, honest, and structured lens you would apply in a real due diligence engagement. Do NOT sugarcoat. Be direct about fatal flaws. A founder needs to hear the truth, not encouragement.

PITCH:
${pitch}

CONTEXT:
- Industry: ${industry || 'Not specified'}
- Stage: ${stage || 'Not specified'}
- Funding Ask: ${fundingAsk || 'Not specified'}
- Target Market: ${targetMarket || 'Not specified'}

Return ONLY valid JSON in this exact structure. No markdown, no explanation:
{
  "verdict": "pass" | "conditional" | "promising" | "strong",
  "overall_score": <integer 0-100>,
  "executive_summary": "<3-4 sentences: what this business is, what the core thesis is, and your bottom-line view as a consultant>",
  "sections": [
    {
      "id": "market",
      "title": "Market Opportunity",
      "score": <0-100>,
      "rating": "weak" | "moderate" | "strong",
      "analysis": "<3-5 sentences of honest consultant analysis. Reference TAM/SAM/SOM if relevant. Call out assumptions>",
      "flags": ["<specific concern>", "<specific concern>"],
      "positives": ["<specific strength>"]
    },
    {
      "id": "model",
      "title": "Business Model & Unit Economics",
      "score": <0-100>,
      "rating": "weak" | "moderate" | "strong",
      "analysis": "<3-5 sentences. How does it make money? Are margins defensible? What breaks the model?>",
      "flags": ["<concern>"],
      "positives": ["<strength>"]
    },
    {
      "id": "differentiation",
      "title": "Competitive Differentiation",
      "score": <0-100>,
      "rating": "weak" | "moderate" | "strong",
      "analysis": "<3-5 sentences. What is the actual moat? Is it defensible? Who kills this in 18 months?>",
      "flags": ["<concern>"],
      "positives": ["<strength>"]
    },
    {
      "id": "gtm",
      "title": "Go-to-Market Strategy",
      "score": <0-100>,
      "rating": "weak" | "moderate" | "strong",
      "analysis": "<3-5 sentences. How do they acquire customers? CAC assumptions? Channel risk?>",
      "flags": ["<concern>"],
      "positives": ["<strength>"]
    },
    {
      "id": "financials",
      "title": "Financial Viability",
      "score": <0-100>,
      "rating": "weak" | "moderate" | "strong",
      "analysis": "<3-5 sentences. Are the financial assumptions realistic? Path to profitability? Burn rate concerns?>",
      "flags": ["<concern>"],
      "positives": ["<strength>"]
    },
    {
      "id": "risk",
      "title": "Risk Profile",
      "score": <0-100>,
      "rating": "low" | "medium" | "high" | "critical",
      "analysis": "<3-5 sentences. Regulatory, execution, market timing, technology, team risks>",
      "flags": ["<concern>"],
      "positives": ["<strength>"]
    }
  ],
  "critical_questions": [
    "<The single most important unanswered question an investor would ask>",
    "<Second most important question>",
    "<Third most important question>"
  ],
  "fatal_flaws": ["<If any exist — the things that could kill this business. Be specific. Max 3. Empty array if none.>"],
  "what_works": ["<Genuinely strong element 1>", "<Genuinely strong element 2>", "<Genuinely strong element 3>"],
  "recommendation": "<2-3 sentences: your honest recommendation. What must the founder fix or prove before this is investable or viable? Speak directly to the founder.>"
}`

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 2500,
    })
    const raw = completion.choices[0].message.content.trim()
    // Strip any markdown fences regardless of variant (```json, ```, ` etc.)
    const text = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/,'').trim()
    // Extract the first { ... } block in case there's prose before/after
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No valid JSON found in response')
    res.json(JSON.parse(match[0]))
  } catch (err) {
    console.error('Pitch analysis error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/dream-reverse — reverse-engineer a dream life into a timeline
router.post('/dream-reverse', async (req, res) => {
  const { dream } = req.body
  if (!dream?.trim()) return res.status(400).json({ error: 'Dream description required' })
  const groq = getGroq()
  const prompt = `You are a world-class life strategist and execution coach. The user has described their dream life. Your job is to reverse-engineer it into a concrete, honest, actionable timeline — working backwards from the dream to what they must do TODAY.

Be specific. Be brutally honest about what it actually takes. Don't be vague or generic. Reference real timelines, real effort, real sacrifices.

Dream: "${dream}"

Return ONLY valid JSON, no markdown:
{
  "dream_title": "<3-6 word title for this dream>",
  "reality_check": "<1-2 honest sentences about what achieving this actually requires>",
  "horizons": [
    {
      "id": "5yr",
      "label": "5 Years",
      "title": "<Where you are in 5 years if you execute>",
      "description": "<2-3 sentences: what your life looks like, what you've achieved>",
      "milestones": ["<specific milestone>", "<specific milestone>", "<specific milestone>"],
      "focus": "<the one thing that matters most at this horizon>"
    },
    {
      "id": "1yr",
      "label": "1 Year",
      "title": "<Where you are in 1 year>",
      "description": "<2-3 sentences>",
      "milestones": ["<milestone>", "<milestone>", "<milestone>"],
      "focus": "<the one thing>"
    },
    {
      "id": "6mo",
      "label": "6 Months",
      "title": "<6-month checkpoint>",
      "description": "<2-3 sentences>",
      "milestones": ["<milestone>", "<milestone>", "<milestone>"],
      "focus": "<the one thing>"
    },
    {
      "id": "1mo",
      "label": "This Month",
      "title": "<What to accomplish this month>",
      "description": "<1-2 sentences>",
      "milestones": ["<action>", "<action>", "<action>"],
      "focus": "<the one thing>"
    },
    {
      "id": "1wk",
      "label": "This Week",
      "title": "<This week's mission>",
      "description": "<1-2 sentences>",
      "milestones": ["<specific action>", "<specific action>", "<specific action>"],
      "focus": "<the one thing>"
    },
    {
      "id": "today",
      "label": "Today",
      "title": "<One specific action for today>",
      "description": "<Exactly what to do in the next 2 hours>",
      "milestones": ["<do this now>", "<do this now>"],
      "focus": "<start here>"
    }
  ]
}`
  try {
    const c = await groq.chat.completions.create({ model: MODEL, messages: [{ role:'user', content:prompt }], temperature: 0.5, max_tokens: 2000 })
    const raw = c.choices[0].message.content.trim()
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('No JSON in response')
    res.json(JSON.parse(raw.slice(s, e + 1)))
  } catch (err) { console.error('Dream reverse error:', err); res.status(500).json({ error: err.message }) }
})

// POST /api/ai/skill-gap — skill gap analysis + 8-week roadmap
router.post('/skill-gap', async (req, res) => {
  const { goal, currentSkills } = req.body
  if (!goal?.trim()) return res.status(400).json({ error: 'Goal required' })
  const groq = getGroq()
  const prompt = `You are a senior learning & development strategist at McKinsey. The user has a goal/dream role. Analyse their skill gaps and build a precise, actionable 8-week learning roadmap.

Goal: "${goal}"
Current skills (self-reported): "${currentSkills || 'Not specified'}"

Return ONLY valid JSON, no markdown:
{
  "goal_title": "<clean 3-5 word title>",
  "summary": "<2-3 sentences: honest assessment of the gap and path>",
  "skills": [
    {
      "name": "<skill name>",
      "category": "<Technical | Soft | Domain | Tool>",
      "current_level": <0-100 estimate based on context>,
      "required_level": <0-100>,
      "gap": <required - current>,
      "roi_score": <0-100, how much this skill moves the needle toward the goal>,
      "priority": "critical" | "high" | "medium" | "low",
      "why": "<1 sentence: why this skill matters for this goal>",
      "resource": "<one specific free resource: course name, book title, or practice method>"
    }
  ],
  "roadmap": [
    {
      "week": 1,
      "theme": "<week theme>",
      "skills_focus": ["<skill name>"],
      "daily_commitment": "<e.g. 45 min/day>",
      "deliverable": "<what you produce or can do by end of week>",
      "action": "<the single most important action this week>"
    }
  ]
}
Return 6-8 skills and exactly 8 roadmap weeks. Be specific with resource names.`
  try {
    const c = await groq.chat.completions.create({ model: MODEL, messages: [{ role:'user', content:prompt }], temperature: 0.4, max_tokens: 2500 })
    const raw = c.choices[0].message.content.trim()
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('No JSON in response')
    res.json(JSON.parse(raw.slice(s, e + 1)))
  } catch (err) { console.error('Skill gap error:', err); res.status(500).json({ error: err.message }) }
})

// ── Startup Studio routes ─────────────────────────────────────────

// POST /api/ai/startup/competitor
router.post('/startup/competitor', async (req, res) => {
  const { idea, industry, targetMarket, knownCompetitors } = req.body
  if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' })
  try {
    const raw = await ask(`You are a competitive intelligence analyst. Map the competitive landscape for this startup idea.

Business Idea: ${idea}
Industry: ${industry || 'Not specified'}
Target Market: ${targetMarket || 'Not specified'}
Known Competitors (user-provided): ${knownCompetitors || 'None'}

Return ONLY valid JSON, no markdown:
{
  "market_overview": "<2-3 sentences: overall competitive dynamics, how crowded it is, where value is being created>",
  "competitors": [
    {
      "name": "<company name>",
      "description": "<what they do in one sentence>",
      "founded": "<year or 'Unknown'>",
      "funding": "<e.g. '$50M Series B' or 'Bootstrapped' or 'Public' or 'Unknown'>",
      "strength": "<their biggest competitive advantage>",
      "weakness": "<their most exploitable gap>",
      "pricing": "<rough pricing model or 'Unknown'>",
      "threat_level": "High" | "Medium" | "Low"
    }
  ],
  "market_gaps": [
    "<specific unmet need or underserved segment that existing players miss>",
    "<gap 2>",
    "<gap 3>"
  ],
  "your_angle": "<2-3 sentences: given the competition, what positioning or differentiation would actually work for this idea — be specific and honest>",
  "red_flags": ["<genuine concern about competing in this space>"],
  "green_flags": ["<genuine reason this idea can win despite competition>", "<reason 2>"]
}

Include 4-7 real competitors. If a known competitor list was provided, include all of them. Be brutally honest about threat levels.`)
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('No JSON found in AI response')
    res.json(JSON.parse(raw.slice(s, e + 1)))
  } catch (err) {
    console.error('Startup competitor error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/startup/business-model
router.post('/startup/business-model', async (req, res) => {
  const { idea, industry, targetMarket, competitors } = req.body
  if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' })
  try {
    const raw = await ask(`You are a business model strategist. Design the optimal business model for this startup.

Business Idea: ${idea}
Industry: ${industry || 'Not specified'}
Target Market: ${targetMarket || 'Not specified'}
Competitive Context: ${competitors ? JSON.stringify(competitors).slice(0, 500) : 'Not provided'}

Return ONLY valid JSON, no markdown:
{
  "recommended_model": "<one of: SaaS / Marketplace / E-commerce / Freemium / Usage-based / Subscription / Services / Advertising / Licensing / Hardware + Software>",
  "why": "<2-3 sentences: why this model fits this idea, market, and competitive landscape specifically>",
  "revenue_streams": [
    { "stream": "<revenue stream name>", "description": "<how it works>", "typical_margin": "<e.g. '70-80%' or '30-40%'>", "priority": "Primary" | "Secondary" | "Future" },
    { "stream": "...", "description": "...", "typical_margin": "...", "priority": "..." }
  ],
  "pricing_strategy": {
    "approach": "<e.g. 'Value-based tiered pricing' or 'Freemium with usage caps'>",
    "suggested_price_range": "<e.g. '$29-$99/month' or '$5-$50 per transaction'>",
    "reasoning": "<why this price point makes sense for this market>"
  },
  "unit_economics": {
    "cac_estimate": "<rough cost to acquire one customer, e.g. '$150-$300'>",
    "ltv_estimate": "<rough lifetime value, e.g. '$1,200-$2,400'>",
    "ltv_cac_ratio": "<e.g. '4:1 (healthy)'>",
    "payback_period": "<e.g. '6-8 months'>"
  },
  "monetization_timeline": "<when the first dollar comes in — e.g. 'Month 1 with first paid customer' or 'Month 6 after free beta'>",
  "model_risks": ["<risk 1 specific to this model for this idea>", "<risk 2>"],
  "alternatives_considered": [
    { "model": "<alternative model>", "why_not": "<why this model is worse for this specific idea>" }
  ]
}`)
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('No JSON found in AI response')
    res.json(JSON.parse(raw.slice(s, e + 1)))
  } catch (err) {
    console.error('Startup business model error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/startup/name-studio
router.post('/startup/name-studio', async (req, res) => {
  const { idea, industry, targetMarket, vibe, keywords } = req.body
  if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' })
  try {
    const raw = await ask(`You are a world-class brand naming expert who has named startups acquired by Google, Apple, and Stripe. Generate 10 startup name options.

Business Idea: ${idea}
Industry: ${industry || 'Not specified'}
Target Market: ${targetMarket || 'Not specified'}
Desired Vibe: ${vibe || 'Modern'}
Keywords to consider: ${keywords || 'None'}

Return ONLY valid JSON, no markdown:
{
  "names": [
    {
      "name": "<startup name — short, memorable, unique>",
      "tagline": "<a punchy 5-8 word tagline that captures the value prop>",
      "domain_hint": "<likely domain format, e.g. 'getname.com' or 'nameapp.io' or 'tryname.com'>",
      "why": "<one sentence: what makes this name work — the specific reason it fits>",
      "style": "<e.g. 'Compound word' or 'Made-up word' or 'Metaphor' or 'Action verb' or 'Descriptive'>",
      "score": <integer 1-10 — how strong this name is for branding, memorability, and domain availability>
    }
  ]
}

Rules:
- All 10 names must be UNIQUE — no overlap in style or root word
- Names should be 1-2 syllables ideally, max 3
- Avoid overused tech naming patterns (add -ly, -ify, -io to random words)
- At least 2 names should feel premium/luxury, 2 should feel approachable/friendly
- Score honestly — most names are 6-7, exceptional ones are 8-9, flawless ones are 10
- Domain hint should reflect realistic availability (popular .com words are taken, suggest alternatives)
- Order by score descending`)
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('No JSON found in AI response')
    res.json(JSON.parse(raw.slice(s, e + 1)))
  } catch (err) {
    console.error('Startup name studio error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/startup/financial
router.post('/startup/financial', async (req, res) => {
  const { idea, businessModel, pricingStrategy, teamSize, location } = req.body
  if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' })
  try {
    const raw = await ask(`You are a startup CFO and financial modeller. Build a realistic 3-year financial projection.

Business Idea: ${idea}
Business Model: ${businessModel || 'SaaS'}
Pricing Strategy: ${pricingStrategy ? JSON.stringify(pricingStrategy) : 'Not specified'}
Team Size: ${teamSize || '1-3 people'}
Location: ${location || 'Not specified'}

Return ONLY valid JSON, no markdown:
{
  "assumptions": [
    "<key assumption 1 — e.g. 'Conservative Month 1 MRR of $0, ramping to $5k by Month 6'>",
    "<assumption 2>",
    "<assumption 3>",
    "<assumption 4>"
  ],
  "startup_costs": [
    { "item": "<cost item>", "amount": "<e.g. '$2,000' or '$500/mo'>", "type": "One-time" | "Monthly" | "Annual" },
    { "item": "...", "amount": "...", "type": "..." }
  ],
  "year1": {
    "revenue": "<e.g. '$48,000'>",
    "cogs": "<e.g. '$8,000'>",
    "gross_profit": "<e.g. '$40,000'>",
    "operating_costs": "<e.g. '$60,000'>",
    "net": "<e.g. '-$20,000'>",
    "customers_eoy": "<e.g. '40'>",
    "mrr_eoy": "<e.g. '$4,000'>"
  },
  "year2": {
    "revenue": "...", "cogs": "...", "gross_profit": "...", "operating_costs": "...", "net": "...", "customers_eoy": "...", "mrr_eoy": "..."
  },
  "year3": {
    "revenue": "...", "cogs": "...", "gross_profit": "...", "operating_costs": "...", "net": "...", "customers_eoy": "...", "mrr_eoy": "..."
  },
  "break_even_month": <integer — month number when cumulative revenue exceeds cumulative costs>,
  "runway_months": "<how many months a typical seed round would last at this burn rate>",
  "key_risks": [
    "<financial risk 1 — specific to this business>",
    "<risk 2>",
    "<risk 3>"
  ],
  "fundraising_note": "<1-2 sentences: whether this business needs external funding and at what stage, or if it can be bootstrapped>"
}

Be conservative but realistic. Don't assume hockey-stick growth in Year 1.`)
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('No JSON found in AI response')
    res.json(JSON.parse(raw.slice(s, e + 1)))
  } catch (err) {
    console.error('Startup financial error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/startup/gtm
router.post('/startup/gtm', async (req, res) => {
  const { idea, targetMarket, businessModel, budget, goal } = req.body
  if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' })
  try {
    const raw = await ask(`You are a growth strategist who has launched 20+ startups from 0 to first 1,000 customers. Build a 12-week go-to-market plan.

Business Idea: ${idea}
Target Market: ${targetMarket || 'Not specified'}
Business Model: ${businessModel || 'Not specified'}
Marketing Budget: ${budget || 'Bootstrap (<$1k)'}
Primary Goal: ${goal || 'First 10 paying customers'}

Return ONLY valid JSON, no markdown:
{
  "strategy_summary": "<2-3 sentences: the core GTM strategy in plain English — who you're targeting, how you're reaching them, and what makes this approach right for this specific business>",
  "first_10_customers": "<specific playbook for the very first 10 customers — exact channels, tactics, and scripts. Be hyper-specific, not generic.>",
  "primary_channel": "<the single most important acquisition channel for this business and why>",
  "channels": [
    {
      "channel": "<channel name>",
      "tactic": "<specific tactic, not just 'use LinkedIn' but 'send 20 personalised DMs per day to CTOs at 50-200 person SaaS companies'>",
      "timeline": "<when to start and expected results>",
      "monthly_cost": "<e.g. '$0' or '$200/mo' or '$500/mo'>",
      "expected_cac": "<e.g. '$50' or '$200'>",
      "difficulty": "Easy" | "Medium" | "Hard"
    }
  ],
  "weeks": [
    {
      "week": 1,
      "theme": "<week theme>",
      "actions": ["<specific action 1>", "<specific action 2>", "<specific action 3>"],
      "milestone": "<what success looks like at end of this week>",
      "focus": "Foundation" | "Outreach" | "Launch" | "Scale"
    }
  ],
  "success_metrics": [
    { "metric": "<metric name>", "week4_target": "<target>", "week12_target": "<target>" }
  ]
}

Include exactly 12 weeks. Channels should be ranked by ROI. Be brutally specific — generic advice like 'post on social media' is not acceptable.`)
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('No JSON found in AI response')
    res.json(JSON.parse(raw.slice(s, e + 1)))
  } catch (err) {
    console.error('Startup GTM error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/startup/legal
router.post('/startup/legal', async (req, res) => {
  const { idea, country, founders, businessType } = req.body
  if (!idea?.trim() || !country?.trim()) return res.status(400).json({ error: 'idea and country are required' })
  try {
    const raw = await ask(`You are a startup lawyer and corporate structuring expert. Advise on the optimal legal structure.

Business Idea: ${idea}
Country of Registration: ${country}
Number of Founders: ${founders || '1'}
Business Type: ${businessType || 'Technology / Software'}

Return ONLY valid JSON, no markdown:
{
  "recommended_structure": "<e.g. 'LLC' or 'C-Corporation' or 'Ltd' or 'LLP' — specific to the country>",
  "why": "<2-3 sentences: why this structure is optimal for this specific business, country, and founder count>",
  "pros": ["<advantage 1>", "<advantage 2>", "<advantage 3>"],
  "cons": ["<disadvantage 1>", "<disadvantage 2>"],
  "registration_steps": [
    { "step": 1, "action": "<specific action>", "timeline": "<e.g. '1-3 days'>", "cost": "<e.g. '$50' or 'Free'>", "service": "<where to do it, e.g. 'IRS.gov' or 'Companies House'>" },
    { "step": 2, "action": "...", "timeline": "...", "cost": "...", "service": "..." }
  ],
  "key_considerations": [
    "<important legal consideration specific to this business type and country — e.g. data privacy laws, licensing requirements>",
    "<consideration 2>",
    "<consideration 3>"
  ],
  "tax_overview": "<2-3 sentences: key tax implications, any beneficial tax treatment for startups in this country, and what to watch out for>",
  "ip_advice": "<2-3 sentences: what IP protections to put in place immediately — patents, trademarks, copyrights — specific to this business>",
  "equity_split_note": "<if multiple founders, a brief note on how to structure equity fairly and what vesting schedule to use>",
  "immediate_actions": ["<do this first — specific>", "<do this second>", "<do this third>"]
}`)
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('No JSON found in AI response')
    res.json(JSON.parse(raw.slice(s, e + 1)))
  } catch (err) {
    console.error('Startup legal error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/startup/pitch-builder
router.post('/startup/pitch-builder', async (req, res) => {
  const { idea, industry, targetMarket, businessModel, financials, competitors, gtm, fundingAsk, equity } = req.body
  if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' })
  try {
    const context = [
      `Idea: ${idea}`,
      industry ? `Industry: ${industry}` : '',
      targetMarket ? `Target Market: ${targetMarket}` : '',
      businessModel ? `Business Model: ${businessModel}` : '',
      fundingAsk ? `Funding Ask: ${fundingAsk}` : '',
      equity ? `Equity Offered: ${equity}` : '',
      financials ? `Financial Highlights: Year 1 revenue ${financials.year1?.revenue || 'TBD'}, Break-even Month ${financials.break_even_month || 'TBD'}` : '',
      gtm ? `GTM: ${gtm.strategy_summary || ''}` : '',
    ].filter(Boolean).join('\n')

    const raw = await ask(`You are a partner at a top VC fund who has reviewed 2,000+ pitch decks and funded 50 startups. Build a complete investor pitch deck.

${context}

Return ONLY valid JSON, no markdown:
{
  "deck_title": "<company name or 'Your Startup Name'> Investor Pitch",
  "one_liner": "<the ultimate 1-sentence description of the business that a VC would remember>",
  "slides": [
    {
      "number": 1,
      "title": "Problem",
      "hook": "<one shocking or compelling opening stat/fact — make investors feel the pain>",
      "key_message": "<the single takeaway from this slide>",
      "bullets": ["<specific bullet point>", "<specific bullet point>", "<specific bullet point>"],
      "design_tip": "<one specific visual or layout suggestion for this slide>"
    },
    { "number": 2, "title": "Solution", "hook": "...", "key_message": "...", "bullets": ["..."], "design_tip": "..." },
    { "number": 3, "title": "Market Size", "hook": "...", "key_message": "...", "bullets": ["..."], "design_tip": "..." },
    { "number": 4, "title": "Product", "hook": "...", "key_message": "...", "bullets": ["..."], "design_tip": "..." },
    { "number": 5, "title": "Business Model", "hook": "...", "key_message": "...", "bullets": ["..."], "design_tip": "..." },
    { "number": 6, "title": "Traction", "hook": "...", "key_message": "...", "bullets": ["..."], "design_tip": "..." },
    { "number": 7, "title": "Competition", "hook": "...", "key_message": "...", "bullets": ["..."], "design_tip": "..." },
    { "number": 8, "title": "Go-to-Market", "hook": "...", "key_message": "...", "bullets": ["..."], "design_tip": "..." },
    { "number": 9, "title": "Financials", "hook": "...", "key_message": "...", "bullets": ["..."], "design_tip": "..." },
    { "number": 10, "title": "The Ask", "hook": "...", "key_message": "...", "bullets": ["..."], "design_tip": "..." }
  ],
  "investor_notes": "<2-3 sentences: the 1-2 things that will make or break this pitch with investors — be brutally honest>",
  "strongest_slide": "<which slide number is the strongest and why>",
  "weakest_slide": "<which slide number needs the most work and what it needs>"
}

Each slide must be specific to this exact business — no generic templates. Bullets should be actual content the founder can use, not placeholders.`)
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('No JSON found in AI response')
    res.json(JSON.parse(raw.slice(s, e + 1)))
  } catch (err) {
    console.error('Startup pitch builder error:', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/startup/production — supplier sourcing, MOQ, quality, shipping
router.post('/startup/production', async (req, res) => {
  const { idea, industry, businessModel, pricingStrategy, targetMarket, sourcingScope, preferredCountry } = req.body
  if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' })
  try {
    const scopeLabel = sourcingScope === 'Local / Regional' ? 'local and regional suppliers' : 'global suppliers'
    const countryNote = preferredCountry ? ' with a strong focus on ' + preferredCountry + '-based manufacturers and platforms' : ''
    const scopeInstruction = 'Tailor ALL supplier platform recommendations, outreach templates, and cost breakdowns specifically to ' + scopeLabel + countryNote + '. For supplier_platforms, prioritise the most well-known and widely-used platforms relevant to this scope and country preference (e.g. if China: Alibaba, Made-in-China, Global Sources; if USA: ThomasNet, Makers Row; if Germany: Wer liefert was; etc.).'
    const raw = await ask(`You are a veteran product sourcing expert and supply chain consultant who has launched 200+ physical products. Give a complete, specific, actionable production and sourcing guide.

Business Idea: ${idea}
Industry: ${industry || 'Not specified'}
Business Model: ${businessModel || 'Not specified'}
Target Market: ${targetMarket || 'Not specified'}
Pricing: ${pricingStrategy ? JSON.stringify(pricingStrategy) : 'Not specified'}
Sourcing Scope: ${sourcingScope || 'Global'}
Preferred Supplier Country: ${preferredCountry || 'No preference — recommend the best options globally'}

IMPORTANT: ${scopeInstruction}

Return ONLY valid JSON:
{
  "overview": "<2-3 sentences: the production reality for this specific business — honest about complexity and costs>",
  "production_type": "<one of: Custom Manufacturing / Private Label / White-label / Print-on-Demand / Dropshipping / Digital / Assembly>",
  "supplier_platforms": [
    {
      "name": "<real platform name>",
      "url": "<actual website>",
      "best_for": "<what this platform excels at for this specific product>",
      "moq_range": "<typical MOQ e.g. '100-500 units' or 'No minimum'>",
      "cost_position": "<Budget / Mid-range / Premium>",
      "how_to_use": "<specific tactic for this product type>"
    }
  ],
  "outreach_template": "<Complete professional email to send suppliers. Include [YOUR COMPANY NAME] [PRODUCT DESCRIPTION] placeholders. Cover: who you are, exact specs, target quantity, timeline, sample request, quote request. 150-200 words. Ready to send.>",
  "key_questions": [
    "<specific question tailored to this product — not generic>",
    "<question 2>", "<question 3>", "<question 4>", "<question 5>", "<question 6>"
  ],
  "moq_guidance": "<specific MOQ advice for this product — what is typical, how to negotiate lower, when to accept higher MOQ>",
  "negotiation_tips": [
    "<specific tactic for this product/industry — not generic>",
    "<tip 2>", "<tip 3>", "<tip 4>"
  ],
  "quality_control": {
    "sample_process": "<exact steps to order and evaluate samples for this product>",
    "inspection_checklist": ["<specific check 1>", "<check 2>", "<check 3>", "<check 4>"],
    "certifications_needed": ["<certification relevant to this product and target market>"]
  },
  "cost_breakdown": [
    { "item": "<cost item>", "typical_range": "<e.g. $2-5 per unit>", "notes": "<important context>" }
  ],
  "shipping": {
    "recommended_incoterms": "<e.g. FOB and why for this situation>",
    "best_methods": ["<method with context for this product weight/volume>"],
    "customs_tips": ["<specific tip for this product category>", "<tip 2>"]
  },
  "packaging": {
    "options": ["<packaging option 1 with cost estimate>", "<option 2>"],
    "recommendation": "<specific recommendation for this product and target market>"
  },
  "total_timeline": "<realistic from first supplier contact to inventory, e.g. 8-14 weeks>",
  "action_steps": [
    { "step": 1, "action": "<specific action>", "timeline": "<e.g. Day 1-3>", "tool": "<specific platform/resource>" },
    { "step": 2, "action": "...", "timeline": "...", "tool": "..." },
    { "step": 3, "action": "...", "timeline": "...", "tool": "..." },
    { "step": 4, "action": "...", "timeline": "...", "tool": "..." },
    { "step": 5, "action": "...", "timeline": "...", "tool": "..." },
    { "step": 6, "action": "...", "timeline": "...", "tool": "..." },
    { "step": 7, "action": "...", "timeline": "...", "tool": "..." },
    { "step": 8, "action": "...", "timeline": "...", "tool": "..." }
  ],
  "red_flags": ["<specific warning for this product when vetting suppliers>", "<red flag 2>"]
}

All advice must be product-specific. Supplier platforms must be real sites. Cost breakdown must include all costs: manufacturing, tooling/molds, inspection, shipping, customs, warehousing.`)
    const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('No JSON found in AI response')
    res.json(JSON.parse(raw.slice(s, e + 1)))
  } catch (err) {
    console.error('Startup production error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
