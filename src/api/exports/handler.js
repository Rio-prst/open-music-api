const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError.js');

class ExportsHandler {
    constructor(service, playlistsService, validator) {
        this._service = service;
        this._playlistsService = playlistsService;
        this._validator = validator;

        autoBind(this);
    }

    async postExportSongsHandler(request, h) {
        this._validator.validateExportSongsPayload(request.payload);

        const {id: userId} = request.auth.credentials;

        const {playlistId} = request.params;
        const {targetEmail} = request.payload;

        await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

        const message = {
            playlistId,
            targetEmail,
        };

        this._service.sendMessage('export:songs', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });

        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;