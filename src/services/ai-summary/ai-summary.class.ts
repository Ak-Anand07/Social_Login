import { BadRequest, GeneralError } from '@feathersjs/errors'
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'

export type ImproveSummaryRequest = {
  text?: string
  jobTitle?: string
  firstName?: string
  lastName?: string
}

export type ImproveSummaryResult = {
  result: string
  model: string
}

const cleanSummaryOutput = (value: string) =>
  value
    .trim()
    .replace(/^here(?:'s| is)\s+(?:a\s+)?rewritten version of (?:the )?resume summary:\s*/i, '')
    .replace(/^here(?:'s| is)\s+(?:an\s+)?improved(?: version of the)? summary:\s*/i, '')
    .replace(/^(?:rewritten|improved)\s+(?:resume\s+)?summary:\s*/i, '')
    .replace(/^summary:\s*/i, '')
    .trim()

export class AiSummaryService implements ServiceInterface<ImproveSummaryResult, ImproveSummaryRequest, Params> {
  constructor(private app: Application) {}

  async create(data: ImproveSummaryRequest, _params?: Params): Promise<ImproveSummaryResult> {
    const sourceText = data.text?.trim()
    if (!sourceText) {
      throw new BadRequest('Summary text is required.')
    }

    const apiKey = this.app.get('groq')?.apiKey?.trim()
    if (!apiKey) {
      throw new GeneralError('Groq API key is not configured on the server.')
    }

    const model = 'llama-3.1-8b-instant'
    const name = [data.firstName?.trim(), data.lastName?.trim()].filter(Boolean).join(' ')
    const role = data.jobTitle?.trim()

    const systemPrompt =
      'You are a professional resume writer. Rewrite resume summaries to sound polished, concise, ATS-friendly, and credible. Keep it to 2-4 sentences. Do not invent fake companies, metrics, or experience. Return plain text only.'

    const userPrompt = [
      name ? `Candidate Name: ${name}` : null,
      role ? `Target Role: ${role}` : null,
      `Original Summary: ${sourceText}`,
      'Task: Improve this resume summary professionally while preserving the original meaning and tone.',
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
        temperature: 0.5,
        max_tokens: 220,
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

    const result = cleanSummaryOutput(payload.choices?.[0]?.message?.content?.trim() ?? '')
    if (!result) {
      throw new GeneralError('Groq returned an empty summary improvement.')
    }

    return { result, model }
  }

  async get(_id: Id, _params?: Params): Promise<ImproveSummaryResult> {
    throw new BadRequest('Method not supported.')
  }

  async update(_id: NullableId, _data: ImproveSummaryRequest, _params?: Params): Promise<ImproveSummaryResult> {
    throw new BadRequest('Method not supported.')
  }

  async patch(_id: NullableId, _data: ImproveSummaryRequest, _params?: Params): Promise<ImproveSummaryResult> {
    throw new BadRequest('Method not supported.')
  }

  async remove(_id: NullableId, _params?: Params): Promise<ImproveSummaryResult> {
    throw new BadRequest('Method not supported.')
  }
}

export const getOptions = (app: Application) => ({ app })
