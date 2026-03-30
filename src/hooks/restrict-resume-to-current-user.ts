import { Forbidden } from '@feathersjs/errors'
import type { HookContext } from '../declarations'

export const restrictResumeToCurrentUser = async (context: HookContext) => {
  const currentUserId = context.params.user?.id

  if (currentUserId == null) {
    return context
  }

  if (context.method === 'find') {
    context.params.query = {
      ...context.params.query,
      userId: currentUserId
    }
  }

  if (context.method === 'get' || context.method === 'patch' || context.method === 'remove') {
    const existing = await (context.service as any)._get(context.id as number, {
      ...context.params,
      query: {
        $select: ['id', 'userId']
      }
    })

    if (existing.userId !== currentUserId) {
      throw new Forbidden('You do not have access to this resume.')
    }
  }

  return context
}
