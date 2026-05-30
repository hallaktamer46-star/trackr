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

export default router
