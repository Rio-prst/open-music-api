const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError.js');

class CollaboratonsHandler {
    constructor(collaborationsService, playlistsService, validator) {
        this._collaborationsService = collaborationsService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        autoBind(this);
    }

    async postCollaborationHandler(request, h) {
        try {
            this._validator.validateCollaboratorPayload(request.payload);
            const {id: credentialId} = request.auth.credentials;
            const {playlistId, userId} = request.payload;

            await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
            const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

            const response = h.response({
                status: 'success',
                message: 'Kolaborasi berhasil ditambahkan',
                data: {
                    collaborationId
                }
            });

            response.code(201);
            return response;
        } catch (error) {
            if (error.code === '23503') { 
                const response = h.response({
                    status: 'fail',
                    message: 'User tidak ditemukan',
                });
                response.code(404);
                return response;
            }

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

    async deleteCollaborationHandler(request, h) {
        try {
            this._validator.validateCollaboratorPayload(request.payload);
            const {id: credentialId} = request.auth.credentials;
            const {playlistId, userId} = request.payload;

            await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
            await this._collaborationsService.deleteCollaboration(playlistId, userId);

            return {
                status: 'success',
                message: 'Kolaborasi berhasil dihapus',
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
}

module.exports = CollaboratonsHandler;
