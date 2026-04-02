import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const hasIsPublic = await knex.schema.hasColumn('resume', 'isPublic')
  const hasPublicSlug = await knex.schema.hasColumn('resume', 'publicSlug')

  await knex.schema.alterTable('resume', (table) => {
    if (!hasIsPublic) table.boolean('isPublic').notNullable().defaultTo(false)
    if (!hasPublicSlug) table.string('publicSlug').nullable().index()
  })

  if (!hasIsPublic) {
    await knex('resume').whereNull('isPublic').update({ isPublic: false })
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasIsPublic = await knex.schema.hasColumn('resume', 'isPublic')
  const hasPublicSlug = await knex.schema.hasColumn('resume', 'publicSlug')

  await knex.schema.alterTable('resume', (table) => {
    if (hasPublicSlug) table.dropColumn('publicSlug')
    if (hasIsPublic) table.dropColumn('isPublic')
  })
}
