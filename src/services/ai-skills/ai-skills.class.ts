import { BadRequest, GeneralError } from '@feathersjs/errors'
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'

export type SuggestSkillsRequest = {
  jobTitle?: string
  summary?: string
  existingSkills?: string[]
  experienceText?: string
}

export type SuggestSkillsResult = {
  results: string[]
  model: string
}

export class AiSkillsService implements ServiceInterface<SuggestSkillsResult, SuggestSkillsRequest, Params> {
  constructor(private app: Application) {}

  async create(data: SuggestSkillsRequest, _params?: Params): Promise<SuggestSkillsResult> {
    const jobTitle = data.jobTitle?.trim()
    const summary = data.summary?.trim()
    const experienceText = data.experienceText?.trim()
    const existingSkills = (data.existingSkills ?? []).map((item) => item.trim()).filter(Boolean)

    if (!jobTitle && !summary && !experienceText) {
      throw new BadRequest('Add a job title, summary, or experience before requesting AI skill suggestions.')
    }

    const apiKey = this.app.get('groq')?.apiKey?.trim()
    if (!apiKey) {
      throw new GeneralError('Groq API key is not configured on the server.')
    }

    const model = 'llama-3.1-8b-instant'
    const systemPrompt =
      'You are a professional resume assistant. Suggest 8 concise, ATS-friendly resume skills tailored to the candidate. Use skill names only. No numbering, no bullets, no explanations. Avoid duplicates and avoid repeating skills already provided.'

    const userPrompt = [
      jobTitle ? `Target Role: ${jobTitle}` : null,
      summary ? `Resume Summary: ${summary}` : null,
      experienceText ? `Experience Notes: ${experienceText}` : null,
      existingSkills.length ? `Existing Skills: ${existingSkills.join(', ')}` : null,
      'Task: Suggest 8 relevant resume skills. Return one skill per line.',
    ]
      .filter(Boolean)
      .join('\n')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 180,
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
      throw new GeneralError('Groq returned empty skill suggestions.')
    }

    const normalizedExisting = new Set(existingSkills.map((item) => item.toLowerCase()))
    const results = raw
      .split('\n')
      .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
      .filter(Boolean)
      .filter((item, index, array) => array.findIndex((entry) => entry.toLowerCase() === item.toLowerCase()) === index)
      .filter((item) => !normalizedExisting.has(item.toLowerCase()))
      .slice(0, 8)

    if (!results.length) {
      throw new GeneralError('Groq did not return usable skill suggestions.')
    }

    return { results, model }
  }

  async get(_id: Id, _params?: Params): Promise<SuggestSkillsResult> {
    throw new BadRequest('Method not supported.')
  }

  async update(_id: NullableId, _data: SuggestSkillsRequest, _params?: Params): Promise<SuggestSkillsResult> {
    throw new BadRequest('Method not supported.')
  }

  async patch(_id: NullableId, _data: SuggestSkillsRequest, _params?: Params): Promise<SuggestSkillsResult> {
    throw new BadRequest('Method not supported.')
  }

  async remove(_id: NullableId, _params?: Params): Promise<SuggestSkillsResult> {
    throw new BadRequest('Method not supported.')
  }
}

export const getOptions = (app: Application) => ({ app })
