const autoBind = require('auto-bind');

class AlbumsHandler {
    constructor(albumsService, storageService, albumsValidator, uploadsValidator) {
        this._albumsService = albumsService;
        this._storageService = storageService;
        this._albumsValidator = albumsValidator;
        this._uploadsValidator = uploadsValidator;

        autoBind(this);
    }

    async postAlbumHandler(request, h) {
        this._albumsValidator.validateAlbumPayload(request.payload);
        const {name, year} = request.payload;

        const albumId = await this._albumsService.addAlbum({name, year});

        const response = h.response({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId
            }
        });

        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request, h) {
        const {id} = request.params;
        const album = await this._albumsService.getAlbumById(id);

        return {
            status: 'success',
            data: {
                album
            }
        }
    }

    async putAlbumByIdHandler(request, h) {
        this._albumsValidator.validateAlbumPayload(request.payload);
        const {id} = request.params;

        await this._albumsService.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui'
        };
    }

    async deleteAlbumByIdHandler(request, h) {
        const {id} = request.params;
        await this._albumsService.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus'
        }
    }

    async postCoverAlbumHandler(request, h) {
        const {id: albumId} = request.params;
        const {cover} = request.payload;

        this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

        const filename = await this._storageService.writeFile(cover, cover.hapi);
        const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;
        await this._albumsService.addAlbumCover(albumId, coverUrl);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });

        response.code(201);
        return response;
    }

    async postLikeHandler(request, h) {
        const {id: userId} = request.auth.credentials;
        const {id: albumId} = request.params;

        await this._albumsService.addLike(userId, albumId);
        
        const response = h.response({
            status: 'success',
            message: 'Album disukai',
        });

        response.code(201);
        return response;
    }

    async deleteLikeHandler(request, h) {
        const {id: userId} = request.auth.credentials;
        const {id: albumId} = request.params;

        await this._albumsService.deleteLike(userId, albumId);

        return {
            status: 'success',
            message: 'Batal menyukai album',
        };
    }

    async getLikesCountHandler(request, h) {
        const {id: albumId} = request.params;

        const {count, isCache} = await this._albumsService.getLikesCount(albumId);

        const response = h.response({
            status: 'success',
            data: {
                likes: count,
            },
        });

        response.code(200);
        
        if (isCache) {
            response.header('X-Data-Source', 'cache');
        }

        return response;
    }
}

module.exports = AlbumsHandler;