const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError.js');
const NotFoundError = require('../../exceptions/NotFound.js');
const {mapSongsDBToModel} = require('../../utils/index.js');


class SongsService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addSong({title, year, genre, performer, duration, albumId}) {
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt]
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Gagal menambahkan lagu');
        }

        return result.rows[0].id;
    }

    async getSongs() {
        const result = await this._pool.query('SELECT * FROM songs');
        return result.rows.map(mapSongsDBToModel);
    }

    async getSongById(id) {
        try {
            const result = await this._cacheService.get(`song:${id}`);
            const song = JSON.parse(result);

            song.isCache = true;

            return song;
        } catch (error) {
            const query = {
                text: 'SELECT * FROM songs WHERE id = $1',
                values: [id]
            };

            const result = await this._pool.query(query);

            if (!result.rows.length) {
                throw new NotFoundError('Lagu dengan id tersebut tidak ditemukan');
            }

            const song = result.rows.map(mapSongsDBToModel)[0];

            await this._cacheService.set(`song:${id}`, JSON.stringify(song));

            song.isCache = false;
            return song;
        }
    }

    async editSongById(id, {title, year, genre, performer, duration, albumId}) {
        const updatedAt = new Date().toISOString();
        
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, updatedAt, id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }

        await this._cacheService.delete(`song:${id}`);
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
        }

        await this._cacheService.delete(`song:${id}`);
    }

    async verifySongExist(songId) {
        const query = {
            text: 'SELECT id FROM songs WHERE id = $1',
            values: [songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
    }
}

module.exports = SongsService;