import { BadRequest, GeneralError } from '@feathersjs/errors'
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'

export type ResumeStarterRequest = {
  prompt?: string
}

export type ResumeStarterResult = {
  title: string
  template: string
  jobTitle: string
  summary: string
  skills: string[]
  strengths: string[]
  hobbies: string[]
  experiences: Array<{
    company: string
    role: string
    desc: string
  }>
  educations: Array<{
    school: string
    degree: string
    field: string
  }>
  achievements: Array<{
    title: string
    desc: string
  }>
  certs: Array<{
    name: string
    issuer: string
    date: string
  }>
  model: string
}

const fallbackStarterFromPrompt = (prompt: string): ResumeStarterResult => {
  const role = prompt.trim() || 'Professional Resume'
  return {
    title: `${role} Resume`,
    template: 'modern',
    jobTitle: role,
    summary: `Motivated ${role.toLowerCase()} candidate with a strong interest in building practical, user-focused solutions. Adaptable and eager to tailor experience, skills, and achievements to the target role.`,
    skills: ['Communication', 'Problem Solving', 'Team Collaboration', 'Adaptability', 'Time Management'],
    strengths: ['Quick Learner', 'Ownership', 'Attention to Detail'],
    hobbies: ['Learning New Tools', 'Reading', 'Projects'],
    experiences: [
      {
        company: 'Add your recent company',
        role,
        desc: 'Add 2 to 3 role-specific accomplishments, tools used, and measurable impact here.',
      },
    ],
    educations: [
      {
        school: 'Add your university or college',
        degree: 'Add your degree',
        field: 'Add your field of study',
      },
    ],
    achievements: [
      {
        title: 'Add a relevant achievement',
        desc: 'Add one notable achievement, award, or project outcome related to this role.',
      },
    ],
    certs: [],
    model: 'fallback',
  }
}

export class AiResumeStarterService implements ServiceInterface<ResumeStarterResult, ResumeStarterRequest, Params> {
  constructor(private app: Application) {}

  async create(data: ResumeStarterRequest, _params?: Params): Promise<ResumeStarterResult> {
    const prompt = data.prompt?.trim()
    if (!prompt) {
      throw new BadRequest('Describe the kind of resume you want to generate.')
    }

    const apiKey = this.app.get('groq')?.apiKey?.trim()
    if (!apiKey) {
      throw new GeneralError('Groq API key is not configured on the server.')
    }

    const model = 'llama-3.1-8b-instant'
    const systemPrompt =
      'You create starter resume drafts from short user prompts. Return strict JSON only. Do not invent personal contact info, real employers, real dates, or fake certifications. Use safe placeholders where real personal history is needed. Make the content helpful, role-specific, and easy for the user to edit.'

    const userPrompt = [
      `User Prompt: ${prompt}`,
      'Return JSON with keys: title, template, jobTitle, summary, skills, strengths, hobbies, experiences, educations, achievements, certs.',
      'Rules:',
      '- template must be one of: modern, corporate, creative, minimal',
      '- skills: 5 to 8 short strings',
      '- strengths: 3 to 4 short strings',
      '- hobbies: 2 to 3 short strings',
      '- experiences: 1 array item with company, role, desc',
      '- educations: 1 array item with school, degree, field',
      '- achievements: 1 array item with title, desc',
      '- certs can be empty',
      '- desc fields should be concise starter text, not fake detailed history',
    ].join('\n')

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.5,
          max_tokens: 900,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new GeneralError(`Groq request failed: ${errorText}`)
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>
      }

      const raw = payload.choices?.[0]?.message?.content?.trim()
      if (!raw) {
        throw new Error('Empty resume starter response')
      }

      const parsed = JSON.parse(raw) as Partial<ResumeStarterResult>

      return {
        title: parsed.title?.trim() || `${prompt} Resume`,
        template: ['modern', 'corporate', 'creative', 'minimal'].includes(parsed.template ?? '') ? (parsed.template as string) : 'modern',
        jobTitle: parsed.jobTitle?.trim() || prompt,
        summary: parsed.summary?.trim() || fallbackStarterFromPrompt(prompt).summary,
        skills: Array.isArray(parsed.skills) ? parsed.skills.map((item) => String(item).trim()).filter(Boolean).slice(0, 8) : fallbackStarterFromPrompt(prompt).skills,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map((item) => String(item).trim()).filter(Boolean).slice(0, 4) : fallbackStarterFromPrompt(prompt).strengths,
        hobbies: Array.isArray(parsed.hobbies) ? parsed.hobbies.map((item) => String(item).trim()).filter(Boolean).slice(0, 3) : fallbackStarterFromPrompt(prompt).hobbies,
        experiences: Array.isArray(parsed.experiences) && parsed.experiences.length > 0
          ? parsed.experiences.slice(0, 1).map((item) => ({
              company: String(item.company ?? 'Add your recent company').trim(),
              role: String(item.role ?? prompt).trim(),
              desc: String(item.desc ?? 'Add 2 to 3 role-specific accomplishments and tools used here.').trim(),
            }))
          : fallbackStarterFromPrompt(prompt).experiences,
        educations: Array.isArray(parsed.educations) && parsed.educations.length > 0
          ? parsed.educations.slice(0, 1).map((item) => ({
              school: String(item.school ?? 'Add your university or college').trim(),
              degree: String(item.degree ?? 'Add your degree').trim(),
              field: String(item.field ?? 'Add your field of study').trim(),
            }))
          : fallbackStarterFromPrompt(prompt).educations,
        achievements: Array.isArray(parsed.achievements) && parsed.achievements.length > 0
          ? parsed.achievements.slice(0, 1).map((item) => ({
              title: String(item.title ?? 'Add a relevant achievement').trim(),
              desc: String(item.desc ?? 'Add one notable role-relevant achievement here.').trim(),
            }))
          : fallbackStarterFromPrompt(prompt).achievements,
        certs: Array.isArray(parsed.certs)
          ? parsed.certs.slice(0, 2).map((item) => ({
              name: String(item.name ?? '').trim(),
              issuer: String(item.issuer ?? '').trim(),
              date: String(item.date ?? '').trim(),
            })).filter((item) => item.name)
          : [],
        model,
      }
    } catch {
      return fallbackStarterFromPrompt(prompt)
    }
  }

  async get(_id: Id, _params?: Params): Promise<ResumeStarterResult> {
    throw new BadRequest('Method not supported.')
  }

  async update(_id: NullableId, _data: ResumeStarterRequest, _params?: Params): Promise<ResumeStarterResult> {
    throw new BadRequest('Method not supported.')
  }

  async patch(_id: NullableId, _data: ResumeStarterRequest, _params?: Params): Promise<ResumeStarterResult> {
    throw new BadRequest('Method not supported.')
  }

  async remove(_id: NullableId, _params?: Params): Promise<ResumeStarterResult> {
    throw new BadRequest('Method not supported.')
  }
}
