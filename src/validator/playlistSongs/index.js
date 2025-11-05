const InvariantError = require('../../exceptions/InvariantError.js');
const PlaylistSongsPayloadSchema = require('./schema.js');

const PlaylistSongsValidator = {
    validatePlaylistSongsPayload: (payload) => {
        const validationResult = PlaylistSongsPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
}

module.exports = PlaylistSongsValidator;
