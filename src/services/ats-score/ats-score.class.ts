import { BadRequest } from '@feathersjs/errors'
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'
import type { Application } from '../../declarations'

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'have',
  'will',
  'your',
  'you',
  'our',
  'are',
  'has',
  'was',
  'were',
  'but',
  'not',
  'all',
  'into',
  'use',
  'using',
  'used',
  'can',
  'able',
  'ability',
  'job',
  'role',
  'work',
  'team',
  'years',
  'year',
  'experience',
  'preferred',
  'required',
  'requirements',
  'including',
  'across',
  'their',
  'them',
  'who',
  'what',
  'when',
  'where',
  'why',
  'how',
  'about',
  'than',
  'then',
  'also',
  'such',
])

export type AtsScoreRequest = {
  jobDescription?: string
  jobTitle?: string
  summary?: string
  email?: string
  phone?: string
  skills?: string[]
  experiences?: Array<{
    company?: string
    role?: string
    desc?: string
  }>
  educations?: Array<{
    school?: string
    degree?: string
    field?: string
  }>
}

export type AtsScoreResult = {
  score: number
  keywordMatch: number
  contentScore: number
  formatScore: number
  missingKeywords: string[]
  strengths: string[]
  improvements: string[]
  aiSuggestions: string[]
  keywordUsageTips: string[]
  summarySuggestion?: string
}

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s/-]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const unique = <T,>(values: T[]) => [...new Set(values)]

const cleanSummaryOutput = (value?: string) =>
  (value ?? '')
    .trim()
    .replace(/^here(?:'s| is)\s+(?:a\s+)?rewritten version of (?:the )?resume summary:\s*/i, '')
    .replace(/^here(?:'s| is)\s+(?:an\s+)?improved(?: version of the)? summary:\s*/i, '')
    .replace(/^(?:rewritten|improved)\s+(?:resume\s+)?summary:\s*/i, '')
    .replace(/^summary:\s*/i, '')
    .trim()

export class AtsScoreService implements ServiceInterface<AtsScoreResult, AtsScoreRequest, Params> {
  constructor(private app: Application) {}

  async create(data: AtsScoreRequest, _params?: Params): Promise<AtsScoreResult> {
    const jobDescription = data.jobDescription?.trim()

    const skills = (data.skills ?? []).map((item) => item.trim()).filter(Boolean)
    const experiences = data.experiences ?? []
    const educations = data.educations ?? []

    const resumeText = [
      data.jobTitle,
      data.summary,
      skills.join(' '),
      experiences.map((item) => [item.company, item.role, item.desc].filter(Boolean).join(' ')).join(' '),
      educations.map((item) => [item.school, item.degree, item.field].filter(Boolean).join(' ')).join(' '),
    ]
      .filter(Boolean)
      .join(' ')

    const jdTokens = jobDescription ? tokenize(jobDescription) : []
    const fallbackKeywordSource = unique([
      ...(data.jobTitle ? tokenize(data.jobTitle) : []),
      ...skills.flatMap((item) => tokenize(item)),
      ...experiences.flatMap((item) => tokenize([item.role, item.desc].filter(Boolean).join(' '))),
    ])
    const topKeywords = unique(jdTokens).slice(0, 18)
    const resumeTokens = new Set(tokenize(resumeText))
    const matchedKeywords = topKeywords.filter((token) => resumeTokens.has(token))
    const missingKeywords = topKeywords.filter((token) => !resumeTokens.has(token)).slice(0, 8)

    let formatScore = 0
    if (data.email?.trim()) formatScore += 35
    if (data.phone?.trim()) formatScore += 25
    if (data.jobTitle?.trim()) formatScore += 20
    if (data.summary?.trim()) formatScore += 20
    formatScore = Math.min(100, formatScore)

    let contentScore = 0
    if (skills.length >= 5) contentScore += 25
    else if (skills.length >= 3) contentScore += 18
    else if (skills.length > 0) contentScore += 10

    const meaningfulExperiences = experiences.filter(
      (item) => item.company?.trim() || item.role?.trim() || item.desc?.trim(),
    )
    const meaningfulEducations = educations.filter(
      (item) => item.school?.trim() || item.degree?.trim() || item.field?.trim(),
    )

    const keywordMatch = jobDescription
      ? Math.round(topKeywords.length ? (matchedKeywords.length / topKeywords.length) * 100 : 0)
      : Math.min(
          96,
          25 +
            (data.jobTitle?.trim() ? 20 : 0) +
            (skills.length >= 5 ? 25 : skills.length >= 3 ? 18 : skills.length > 0 ? 10 : 0) +
            (meaningfulExperiences.length > 0 ? 18 : 0) +
            (meaningfulEducations.length > 0 ? 8 : 0),
        )

    if (meaningfulExperiences.length > 0) contentScore += 30
    if (meaningfulEducations.length > 0) contentScore += 15
    if ((data.summary?.trim().length ?? 0) >= 80) contentScore += 15

    const descText = meaningfulExperiences.map((item) => item.desc?.trim() ?? '').join(' ')
    if (/\b(led|built|improved|designed|developed|implemented|optimized|managed|created|delivered)\b/i.test(descText)) {
      contentScore += 15
    }

    contentScore = Math.min(100, contentScore)

    const score = Math.max(32, Math.min(98, Math.round(keywordMatch * 0.45 + contentScore * 0.35 + formatScore * 0.2)))

    const strengths: string[] = []
    const improvements: string[] = []

    if (jobDescription) {
      if (keywordMatch >= 65) strengths.push('Strong keyword alignment with the job description.')
      else improvements.push('Add more keywords from the job description into your summary, skills, and experience.')
    } else {
      if (skills.length >= 5 && meaningfulExperiences.length > 0) {
        strengths.push('Core resume keywords are reasonably covered across skills and experience.')
      } else {
        improvements.push('Add clearer role-specific keywords across your summary, skills, and experience.')
      }
    }

    if (meaningfulExperiences.length > 0) strengths.push('Work experience section is present and helps ATS relevance.')
    else improvements.push('Add at least one meaningful work experience entry.')

    if (skills.length >= 5) strengths.push('Skills coverage is solid for ATS scanning.')
    else improvements.push('Add more relevant hard skills that match the target role.')

    if (data.summary?.trim()) strengths.push('Professional summary is present.')
    else improvements.push('Add a concise professional summary for stronger ATS context.')

    if (!data.email?.trim() || !data.phone?.trim()) {
      improvements.push('Include both email and phone number to improve resume completeness.')
    }

    if (!/\d/.test(descText) && meaningfulExperiences.length > 0) {
      improvements.push('Add measurable impact or numbers in experience bullets where possible.')
    }

    const aiEnhancement = await this.getAiSuggestions({
      jobDescription,
      jobTitle: data.jobTitle?.trim(),
      summary: data.summary?.trim(),
      missingKeywords: (jobDescription ? missingKeywords : fallbackKeywordSource.slice(0, 6)).map(toTitleCase),
      strengths: strengths.slice(0, 4),
      improvements: improvements.slice(0, 5),
    })

    return {
      score,
      keywordMatch,
      contentScore,
      formatScore,
      missingKeywords: (jobDescription ? missingKeywords : fallbackKeywordSource.slice(0, 6)).map(toTitleCase),
      strengths: strengths.slice(0, 4),
      improvements: improvements.slice(0, 5),
      aiSuggestions: aiEnhancement.aiSuggestions,
      keywordUsageTips: aiEnhancement.keywordUsageTips,
      summarySuggestion: aiEnhancement.summarySuggestion,
    }
  }

  private async getAiSuggestions(input: {
    jobDescription?: string
    jobTitle?: string
    summary?: string
    missingKeywords: string[]
    strengths: string[]
    improvements: string[]
  }) {
    const apiKey = this.app.get('groq')?.apiKey?.trim()
    if (!apiKey) {
      return {
        aiSuggestions: input.improvements.slice(0, 3),
        keywordUsageTips: input.missingKeywords.slice(0, 3).map((item) => `Work "${item}" naturally into your summary or experience.`),
        summarySuggestion: input.summary,
      }
    }

    const model = 'llama-3.1-8b-instant'
    const systemPrompt =
      'You are an ATS resume coach. Return compact, practical guidance only. Respond with strict JSON keys: aiSuggestions (string[]), keywordUsageTips (string[]), summarySuggestion (string). Keep aiSuggestions to 3 items, keywordUsageTips to 3 items, and summarySuggestion under 320 characters.'

    const userPrompt = [
      input.jobTitle ? `Target Role: ${input.jobTitle}` : null,
      input.jobDescription ? `Job Description: ${input.jobDescription}` : 'No job description provided. Give general ATS improvement guidance based on the current resume only.',
      input.summary ? `Current Summary: ${input.summary}` : null,
      `Missing Keywords: ${input.missingKeywords.join(', ') || 'None'}`,
      `Current Strengths: ${input.strengths.join(' | ') || 'None'}`,
      `Current Improvements: ${input.improvements.join(' | ') || 'None'}`,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 420,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>
      }

      const content = payload.choices?.[0]?.message?.content?.trim()
      if (!content) {
        throw new Error('Empty ATS AI response')
      }

      const parsed = JSON.parse(content) as {
        aiSuggestions?: string[]
        keywordUsageTips?: string[]
        summarySuggestion?: string
      }

      return {
        aiSuggestions: (parsed.aiSuggestions ?? []).filter(Boolean).slice(0, 3),
        keywordUsageTips: (parsed.keywordUsageTips ?? []).filter(Boolean).slice(0, 3),
        summarySuggestion: cleanSummaryOutput(parsed.summarySuggestion) || input.summary,
      }
    } catch {
      return {
        aiSuggestions: input.improvements.slice(0, 3),
        keywordUsageTips: input.missingKeywords.slice(0, 3).map((item) => `Work "${item}" naturally into your summary or experience.`),
        summarySuggestion: input.summary,
      }
    }
  }

  async get(_id: Id, _params?: Params): Promise<AtsScoreResult> {
    throw new BadRequest('Method not supported.')
  }

  async update(_id: NullableId, _data: AtsScoreRequest, _params?: Params): Promise<AtsScoreResult> {
    throw new BadRequest('Method not supported.')
  }

  async patch(_id: NullableId, _data: AtsScoreRequest, _params?: Params): Promise<AtsScoreResult> {
    throw new BadRequest('Method not supported.')
  }

  async remove(_id: NullableId, _params?: Params): Promise<AtsScoreResult> {
    throw new BadRequest('Method not supported.')
  }
}
