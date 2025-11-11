/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

export const up = (pgm) => {
    pgm.createTable('user_album_likes', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        album_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });

    pgm.addConstraint('user_album_likes', 'user_album_likes_user_id_fk', {
        foreignKeys: {
            columns: 'user_id',
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
    });

    pgm.addConstraint('user_album_likes', 'user_album_likes_album_id_fk', {
        foreignKeys: {
            columns: 'album_id',
            references: 'albums(id)',
            onDelete: 'CASCADE',
        },
    });

    pgm.addConstraint('user_album_likes', 'unique_user_album_like', 'UNIQUE(user_id, album_id)');
};

export const down = (pgm) => {
    pgm.dropTable('user_album_likes');
};
