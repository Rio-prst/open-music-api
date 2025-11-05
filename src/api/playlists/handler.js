const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError.js');

class PlaylistsHandler {
    constructor(playlistsService, songsService, collaborationsService, playlistsValidator, playlistSongsValidator) {
        this._playlistsService = playlistsService;
        this._songsService = songsService;
        this._collaborationsService = collaborationsService;
        this._playlistsValidator = playlistsValidator;
        this._playlistSongsValidator = playlistSongsValidator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        try {
            this._playlistsValidator.validatePlaylistPayload(request.payload);
            const {name} = request.payload;
            const {id: credentialId} = request.auth.credentials;

            const playlistId = await this._playlistsService.addPlaylist({name, owner: credentialId});

            const response = h.response({
                status: 'success',
                data: {
                    playlistId,
                },
            });

            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });

                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kesalahan pada server kami',
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getPlaylistsHandler(request) {
        const {id: credentialId} = request.auth.credentials;
        const playlists = await this._playlistsService.getPlaylists(credentialId);

        return {
            status: 'success',
            data: {
                playlists,
            }
        };
    }

    async deletePlaylistByIdHandler(request, h) {
        try {
            const {id} = request.params;
            const {id: credentialId} = request.auth.credentials;

            await this._playlistsService.verifyPlaylistOwner(id, credentialId);
            await this._playlistsService.deletePlaylistById(id);

            return {
                status: 'success',
                message: 'Playlist berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });

                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kesalahan pada server kami',
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async postSongToPlaylistHandler(request, h) {
        this._playlistSongsValidator.validatePlaylistSongsPayload(request.payload);
        const {songId} = request.payload;
        const  {id: credentialId} = request.auth.credentials;
        const {id: playlistId} = request.params;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        await this._songsService.verifySongExist(songId);
        await this._playlistsService.addSongToPlaylist(playlistId, songId);
        await this._playlistsService.addActivity({playlistId, songId, userId: credentialId, action: 'add'});

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
        });

        response.code(201);
        return response;
    }

    async getSongFromPlaylistHandler(request, h) {
        const {id: credentialId} = request.auth.credentials;
        const {id: playlistId} = request.params;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        const playlist = await this._playlistsService.getSongsFromPlaylist(playlistId);

        const response = h.response({
            status: 'success',
            data: {
                playlist,
            },
        });

        response.code(200);
        return response;
    }

    async deleteSongFromPlaylistHandler(request, h) {
        this._playlistSongsValidator.validatePlaylistSongsPayload(request.payload);
        const {songId} = request.payload;
        const {id: credentialId} = request.auth.credentials;
        const {id: playlistId} = request.params;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);
        await this._playlistsService.addActivity({playlistId, songId, userId: credentialId, action: 'delete'});

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        });

        response.code(200);
        return response;
    }

    async getPlaylistActivitiesHandler(request, h) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        
        const activities = await this._playlistsService.getPlaylistActivities(playlistId);

        return {
            status: 'success',
            data: {
                playlistId,
                activities, 
            },
        };
    }
} 

module.exports = PlaylistsHandler;