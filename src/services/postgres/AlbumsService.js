const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError.js');
const NotFoundError = require('../../exceptions/NotFound.js');
const {mapAlbumsDBToModel} = require('../../utils/index.js');

class AlbumsService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
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

    async getAlbumById(id) {
        const albumQuery = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id]
        };

        const albumResult = await this._pool.query(albumQuery);

        if (!albumResult.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        const songsQuery = {
            text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
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

    async addAlbumCover(albumId, coverUrl) {
        const query = {
            text: 'UPDATE albums SER cover_url = $1 WHERE id = $2 RETURNING id',
            values: [coverUrl, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui sampul album. Album tidak ditemukan');
        }
    }

    async addLike(userId, albumId) {
        const id = `like-${nanoid(16)}`;

        const albumIsExist = {
            text: 'SELECT id FROM albums WHERE id = $1',
            values: [albumId],
        };

        const album = await this._pool.query(albumIsExist);
        if (!album.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        const checkQuery = {
            text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };

        const checkResult = await this._pool.query(checkQuery);
        if (checkResult.rows.length > 0) {
            throw new InvariantError('Anda sudah menyukai album ini');
        }

        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };

        await this._pool.query(query);
        await this._cacheService.delete(`like:${albumId}`);
        return id;
    }

    async deleteLike(userId, albumId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Anda belum menyukai album ini');
        }

        await this._cacheService.delete(`like:${albumId}`);
    }

    async getLikesCount(albumId) {
        try {
            const result = await this._cacheService.get(`like:${albumId}`);

            return {
                count: JSON.parse(result),
                isCache: true,
            };
        } catch (error) {
            const query = {
                text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };

            const result = await this._pool.query(query);
            const count  = parseInt(result.rows[0].likes, 10);

            await this._cacheService.set(`like:${albumId}`, JSON.stringify(count));

            return {
                status: 'success',
                count,
                isCache: false,
            };
        }
    }
}

module.exports = AlbumsService;