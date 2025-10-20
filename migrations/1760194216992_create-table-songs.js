/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
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
            type: 'TEXT',
            notNull: true
        },
        genre: {
            type: 'TEXT',
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
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('songs');
};
