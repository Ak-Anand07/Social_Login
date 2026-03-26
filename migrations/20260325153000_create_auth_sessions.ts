import type { Knex } from 'knex'

const tableName = 'auth_sessions'

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable(tableName)

  if (hasTable) {
    return
  }

  await knex.schema.createTable(tableName, table => {
    table.increments('id')
    table.integer('userId').notNullable()
    table.string('provider').nullable()
    table.string('name').nullable()
    table.string('email').nullable()
    table.text('sessionToken').nullable().unique()
    table.datetime('loginAt').nullable()
    table.datetime('logoutAt').nullable()
    table.datetime('createdAt').nullable()
    table.datetime('updatedAt').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable(tableName)

  if (!hasTable) {
    return
  }

  await knex.schema.dropTable(tableName)
}
