import type { Knex } from 'knex'

const usersTable = 'users'

const addColumnIfMissing = async (
  knex: Knex,
  columnName: string,
  apply: (table: Knex.CreateTableBuilder) => void
) => {
  const hasColumn = await knex.schema.hasColumn(usersTable, columnName)

  if (hasColumn) {
    return
  }

  await knex.schema.alterTable(usersTable, table => {
    apply(table)
  })
}

export async function up(knex: Knex): Promise<void> {
  const hasUsersTable = await knex.schema.hasTable(usersTable)

  if (!hasUsersTable) {
    return
  }

  await addColumnIfMissing(knex, 'name', table => {
    table.string('name').nullable()
  })

  await addColumnIfMissing(knex, 'avatar', table => {
    table.string('avatar').nullable()
  })

  await addColumnIfMissing(knex, 'createdAt', table => {
    table.string('createdAt').nullable()
  })

  await addColumnIfMissing(knex, 'updatedAt', table => {
    table.string('updatedAt').nullable()
  })

  const now = new Date().toISOString()

  await knex(usersTable)
    .whereNull('createdAt')
    .update({ createdAt: now })

  await knex(usersTable)
    .whereNull('updatedAt')
    .update({ updatedAt: now })
}

export async function down(knex: Knex): Promise<void> {
  const hasUsersTable = await knex.schema.hasTable(usersTable)

  if (!hasUsersTable) {
    return
  }

  for (const columnName of ['name', 'avatar', 'createdAt', 'updatedAt']) {
    const hasColumn = await knex.schema.hasColumn(usersTable, columnName)

    if (!hasColumn) {
      continue
    }

    await knex.schema.alterTable(usersTable, table => {
      table.dropColumn(columnName)
    })
  }
}
