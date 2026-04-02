import { BadRequest, GeneralError } from '@feathersjs/errors'
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'

export type GenerateExperienceBulletsRequest = {
  jobTitle?: string
  summary?: string
  company?: string
  role?: string
  currentDescription?: string
  extraContext?: string
}

export type GenerateExperienceBulletsResult = {
  results: string[]
  model: string
}

export class AiExperienceBulletsService
  implements ServiceInterface<GenerateExperienceBulletsResult, GenerateExperienceBulletsRequest, Params>
{
  constructor(private app: Application) {}

  async create(data: GenerateExperienceBulletsRequest, _params?: Params): Promise<GenerateExperienceBulletsResult> {
    const jobTitle = data.jobTitle?.trim()
    const summary = data.summary?.trim()
    const company = data.company?.trim()
    const role = data.role?.trim()
    const currentDescription = data.currentDescription?.trim()
    const extraContext = data.extraContext?.trim()

    if (!jobTitle && !summary && !company && !role && !currentDescription && !extraContext) {
      throw new BadRequest('Add a role, company, summary, or experience notes before generating AI bullet points.')
    }

    const apiKey = this.app.get('groq')?.apiKey?.trim()
    if (!apiKey) {
      throw new GeneralError('Groq API key is not configured on the server.')
    }

    const model = 'llama-3.1-8b-instant'
    const systemPrompt =
      'You are a professional resume writer. Generate 4 concise, ATS-friendly resume bullet points for one experience entry. Use action-oriented language. Keep each bullet to one line. Do not invent fake employers, technologies, metrics, or achievements. If details are limited, write credible, editable bullets. Return plain text only, one bullet per line, with no intro or explanation.'

    const userPrompt = [
      jobTitle ? `Target Role: ${jobTitle}` : null,
      summary ? `Resume Summary: ${summary}` : null,
      company ? `Company: ${company}` : null,
      role ? `Experience Role: ${role}` : null,
      currentDescription ? `Current Notes: ${currentDescription}` : null,
      extraContext ? `Extra Context: ${extraContext}` : null,
      'Task: Generate 4 strong bullet points for this experience entry.',
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
        max_tokens: 260,
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
      throw new GeneralError('Groq returned empty experience bullet suggestions.')
    }

    const results = raw
      .split('\n')
      .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
      .filter(Boolean)
      .filter((item, index, array) => array.findIndex((entry) => entry.toLowerCase() === item.toLowerCase()) === index)
      .slice(0, 4)

    if (!results.length) {
      throw new GeneralError('Groq did not return usable experience bullet suggestions.')
    }

    return { results, model }
  }

  async get(_id: Id, _params?: Params): Promise<GenerateExperienceBulletsResult> {
    throw new BadRequest('Method not supported.')
  }

  async update(_id: NullableId, _data: GenerateExperienceBulletsRequest, _params?: Params): Promise<GenerateExperienceBulletsResult> {
    throw new BadRequest('Method not supported.')
  }

  async patch(_id: NullableId, _data: GenerateExperienceBulletsRequest, _params?: Params): Promise<GenerateExperienceBulletsResult> {
    throw new BadRequest('Method not supported.')
  }

  async remove(_id: NullableId, _params?: Params): Promise<GenerateExperienceBulletsResult> {
    throw new BadRequest('Method not supported.')
  }
}

export const getOptions = (app: Application) => ({ app })
