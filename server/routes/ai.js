import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import multer from 'multer'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'

const router = Router()

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

function getModel() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set in .env')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

// CV / Resume Review
router.post('/cv-review', async (req, res) => {
  const { cvText } = req.body
  if (!cvText?.trim()) return res.status(400).json({ error: 'cvText is required' })

  try {
    const model = getModel()
    const prompt = `You are an expert career coach and ATS specialist. Analyse this CV/resume and return a JSON object with exactly this shape:
{
  "score": <integer 1-10>,
  "summary": "<one sentence overall verdict>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": [
    { "line": "<quote or paraphrase a short line from the CV>", "suggestion": "<specific rewrite or improvement>" },
    { "line": "...", "suggestion": "..." },
    { "line": "...", "suggestion": "..." }
  ]
}

Respond ONLY with the raw JSON object. No markdown, no code fences, no explanation.

CV:
${cvText}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
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
    const model = getModel()
    const prompt = `You are an expert hiring manager and cover letter coach. Analyse this cover letter against the job description and return a JSON object with exactly this shape:
{
  "relevance_score": <integer 1-10>,
  "tone": "<e.g. Professional, Confident, Formal, Warm, Generic>",
  "missing": ["<missing element 1>", "<missing element 2>", "<missing element 3>"],
  "rewrites": [
    {
      "original": "<a short quoted phrase from the cover letter>",
      "rewrite": "<a stronger version of that phrase>",
      "reason": "<one sentence explaining why>"
    },
    { "original": "...", "rewrite": "...", "reason": "..." },
    { "original": "...", "rewrite": "...", "reason": "..." }
  ]
}

Respond ONLY with the raw JSON object. No markdown, no code fences, no explanation.

JOB DESCRIPTION:
${jobDescription}

COVER LETTER:
${coverLetter}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
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
    const model = getModel()
    const prompt = `Write a professional, warm, and concise follow-up email for a job seeker who is ${scenarioMap[scenario] || scenario}.

Company: ${company}
Job Title: ${jobTitle}

Requirements:
- 3–4 short paragraphs maximum
- Warm but professional tone
- Personalised with the company and role name
- First line must be the subject line formatted as: Subject: ...
- Ready to send with minimal editing
- Do not use [placeholder] brackets

Return ONLY the email text (subject line then body). No commentary, no markdown.`

    const result = await model.generateContent(prompt)
    res.json({ email: result.response.text().trim() })
  } catch (err) {
    console.error('Follow-up error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
