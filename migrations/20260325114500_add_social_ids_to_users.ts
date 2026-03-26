import type { Knex } from 'knex'

const usersTable = 'users'
const socialColumns = ['linkedinId', 'twitterId', 'facebookId'] as const

export async function up(knex: Knex): Promise<void> {
  const hasUsersTable = await knex.schema.hasTable(usersTable)

  if (!hasUsersTable) {
    return
  }

  for (const columnName of socialColumns) {
    const hasColumn = await knex.schema.hasColumn(usersTable, columnName)

    if (hasColumn) {
      continue
    }

    await knex.schema.alterTable(usersTable, table => {
      table.string(columnName).nullable()
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasUsersTable = await knex.schema.hasTable(usersTable)

  if (!hasUsersTable) {
    return
  }

  for (const columnName of socialColumns) {
    const hasColumn = await knex.schema.hasColumn(usersTable, columnName)

    if (!hasColumn) {
      continue
    }

    await knex.schema.alterTable(usersTable, table => {
      table.dropColumn(columnName)
    })
  }
}
