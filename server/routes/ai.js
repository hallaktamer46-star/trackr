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

export default router
