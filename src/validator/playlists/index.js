const InvariantError = require('../../exceptions/InvariantError.js');
const PlaylistPayloadSchema = require('./schema.js');

const PlaylistsValidator = {
    validatePlaylistPayload: (payload) => {
        const validationResult = PlaylistPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
}

module.exports = PlaylistsValidator;
