import type { Knex } from 'knex'

const usersTable = 'users'
const githubIdColumn = 'githubId'

export async function up(knex: Knex): Promise<void> {
  const hasUsersTable = await knex.schema.hasTable(usersTable)

  if (!hasUsersTable) {
    return
  }

  const hasGithubIdColumn = await knex.schema.hasColumn(usersTable, githubIdColumn)

  if (hasGithubIdColumn) {
    return
  }

  await knex.schema.alterTable(usersTable, table => {
    table.string(githubIdColumn).nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  const hasUsersTable = await knex.schema.hasTable(usersTable)

  if (!hasUsersTable) {
    return
  }

  const hasGithubIdColumn = await knex.schema.hasColumn(usersTable, githubIdColumn)

  if (!hasGithubIdColumn) {
    return
  }

  await knex.schema.alterTable(usersTable, table => {
    table.dropColumn(githubIdColumn)
  })
}
