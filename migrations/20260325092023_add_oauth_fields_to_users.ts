import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const columnsToAdd: { name: string, type: 'string' | 'timestamp' }[] = [];

  const columnDefinitions: { [key: string]: 'string' | 'timestamp' } = {
    'avatar': 'string',
    'name': 'string',
    'googleId': 'string',
    'githubId': 'string',
    'facebookId': 'string',
    'linkedinId': 'string',
    'createdAt': 'timestamp',
    'updatedAt': 'timestamp'
  };

  for (const name in columnDefinitions) {
    if (!(await knex.schema.hasColumn('users', name))) {
      columnsToAdd.push({ name, type: columnDefinitions[name] });
    }
  }

  if (columnsToAdd.length > 0) {
    await knex.schema.alterTable('users', table => {
      for (const col of columnsToAdd) {
        if (col.type === 'string') {
          table.string(col.name);
        } else if (col.type === 'timestamp') {
          table.timestamp(col.name);
        }
      }
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const columnsToDrop = [
    'avatar', 'name', 'googleId', 'githubId',
    'facebookId', 'linkedinId', 'createdAt', 'updatedAt'
  ];

  const existingColumns = (await Promise.all(
    columnsToDrop.map(col => knex.schema.hasColumn('users', col))
  )).map((exists, i) => exists ? columnsToDrop[i] : null).filter(Boolean) as string[];

  if (existingColumns.length > 0) {
    await knex.schema.alterTable('users', table => {
      table.dropColumns(...existingColumns);
    });
  }
}