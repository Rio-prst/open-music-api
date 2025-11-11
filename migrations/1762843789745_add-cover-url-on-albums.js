/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

export const up = (pgm) => {
    pgm.addColumn('albums', {
        cover_url: {
            type: 'TEXT',
            notNull: false,
        },
    });
};

export const down = (pgm) => {
    pgm.dropColumn('albums', 'cover_url');
};
