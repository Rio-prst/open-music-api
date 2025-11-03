/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable('songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        title: {
            type: 'TEXT',
            notNull: true
        },
        year: {
            type: 'INTEGER',
            notNull: true
        },
        performer: {
            type: 'VARCHAR(50)',
            notNull: true
        },
        genre: {
            type: 'VARCHAR(50)',
            notNull: true
        },
        duration: {
            type: 'INTEGER',
            notNull: true
        },
        album_id: {
            type: 'VARCHAR(50)',
            notNull: false,
            references: 'albums',
            onDelete: 'CASCADE'
        },
        created_at: {
            type: 'TEXT',
            notNull: true
        },
        updated_at: {
            type: 'TEXT',
            notNull: true
        }
    });
};

export const down = (pgm) => {
  pgm.dropTable('songs');
};
