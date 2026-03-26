import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('users', 'linkedinId');
  if (!hasColumn) {
    await knex.schema.alterTable('users', table => {
      table.string('linkedinId').nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('users', 'linkedinId');
  if (hasColumn) {
    await knex.schema.alterTable('users', table => {
      table.dropColumn('linkedinId');
    });
  }
}