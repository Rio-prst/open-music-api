const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError.js');
const NotFoundError = require('../../exceptions/NotFound.js');
const {mapAlbumsDBToModel} = require('../../utils/index.js');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({name, year}) {
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
        
        const query = {
            text: 'INSERT INTO albums (id, name, year, created_at, updated_at) VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, year, createdAt, updatedAt]
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    // async getAlbumById(id) {
    //     const query = {
    //         text: 'SELECT * FROM albums WHERE id = $1',
    //         values: [id]
    //     };

    //     const result = await this._pool.query(query);

    //     if (!result.rows.length) {
    //         throw new NotFoundError('Album dengan id tersebut tidak ditemukan');
    //     }

    //     return result.rows.map(mapAlbumsDBToModel)[0];
    // }

    async getAlbumById(id) {
    // Query untuk album
        const albumQuery = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id]
        };

        const albumResult = await this._pool.query(albumQuery);

        if (!albumResult.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        // Query untuk songs di album
        const songsQuery = {
            text: 'SELECT id, title, performer FROM songs WHERE "album_id" = $1',
            values: [id]
        };

        const songsResult = await this._pool.query(songsQuery);

        const album = albumResult.rows[0];
        return {
            id: album.id,
            name: album.name,
            year: album.year,
            songs: songsResult.rows
        };
    }

    // async getAlbumById(id) {
    //     const query = {
    //         text: `
    //         SELECT 
    //             a.id AS album_id,
    //             a.name AS album_name,
    //             a.year AS album_year,
    //             s.id AS song_id,
    //             s.title AS song_title,
    //             s.performer AS song_performer
    //         FROM albums a
    //         LEFT JOIN songs s ON a.id = s.album_id
    //         WHERE a.id = $1
    //         `,
    //         values: [id],
    //     };

    //     const result = await this._pool.query(query);

    //     if (!result.rows.length) {
    //         throw new NotFoundError('Album tidak ditemukan');
    //     }

    //     const { album_id, album_name, album_year } = result.rows[0];

    //     const songs = result.rows
    //         .filter(r => r.song_id)
    //         .map(r => ({
    //         id: r.song_id,
    //         title: r.song_title,
    //         performer: r.song_performer,
    //         }));

    //     return {
    //         id: album_id,
    //         name: album_name,
    //         year: album_year,
    //         songs,
    //     };
    // }

    async editAlbumById(id, {name, year}) {
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updatedAt, id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
        }
    }
}

module.exports = AlbumsService;