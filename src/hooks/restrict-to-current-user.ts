import type { HookContext } from '../declarations'

export const restrictToCurrentUser = async (context: HookContext) => {
  const { params, id, method } = context
  const currentUserId = params.user?.id

  if (currentUserId == null) {
    return context
  }

  if (method === 'find') {
    context.params.query = {
      ...params.query,
      id: currentUserId
    }
  }

  if (method === 'get') {
    context.id = currentUserId
  }

  if (method === 'patch' || method === 'remove') {
    context.id = currentUserId
  }

  if (id != null && method === 'get') {
    context.id = currentUserId
  }

  return context
}
