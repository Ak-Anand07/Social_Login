import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasUserId = await knex.schema.hasColumn('resume', 'userId')
  const hasTitle = await knex.schema.hasColumn('resume', 'title')
  const hasTemplate = await knex.schema.hasColumn('resume', 'template')
  const hasStatus = await knex.schema.hasColumn('resume', 'status')
  const hasData = await knex.schema.hasColumn('resume', 'data')
  const hasCreatedAt = await knex.schema.hasColumn('resume', 'createdAt')
  const hasUpdatedAt = await knex.schema.hasColumn('resume', 'updatedAt')

  await knex.schema.alterTable('resume', (table) => {
    if (!hasUserId) table.integer('userId').index()
    if (!hasTitle) table.string('title')
    if (!hasTemplate) table.string('template')
    if (!hasStatus) table.string('status')
    if (!hasData) table.text('data')
    if (!hasCreatedAt) table.timestamp('createdAt')
    if (!hasUpdatedAt) table.timestamp('updatedAt')
  })

  await knex('resume')
    .whereNull('title')
    .update({ title: knex.raw("COALESCE(NULLIF(text, ''), 'Untitled Resume')") })

  await knex('resume')
    .whereNull('template')
    .update({ template: 'modern' })

  await knex('resume')
    .whereNull('status')
    .update({ status: 'draft' })

  const now = new Date().toISOString()

  await knex('resume')
    .whereNull('createdAt')
    .update({ createdAt: now })

  await knex('resume')
    .whereNull('updatedAt')
    .update({ updatedAt: now })
}

export async function down(knex: Knex): Promise<void> {
  const hasUserId = await knex.schema.hasColumn('resume', 'userId')
  const hasTitle = await knex.schema.hasColumn('resume', 'title')
  const hasTemplate = await knex.schema.hasColumn('resume', 'template')
  const hasStatus = await knex.schema.hasColumn('resume', 'status')
  const hasData = await knex.schema.hasColumn('resume', 'data')
  const hasCreatedAt = await knex.schema.hasColumn('resume', 'createdAt')
  const hasUpdatedAt = await knex.schema.hasColumn('resume', 'updatedAt')

  await knex.schema.alterTable('resume', (table) => {
    if (hasUserId) table.dropColumn('userId')
    if (hasTitle) table.dropColumn('title')
    if (hasTemplate) table.dropColumn('template')
    if (hasStatus) table.dropColumn('status')
    if (hasData) table.dropColumn('data')
    if (hasCreatedAt) table.dropColumn('createdAt')
    if (hasUpdatedAt) table.dropColumn('updatedAt')
  })
}
