const InvariantError = require('../../exceptions/InvariantError.js');
const {AlbumPayloadSchema} = require('./schema.js');

const AlbumsValidator = {
    validateAlbumPayload: (payload) => {
        const validationResult = AlbumPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
}

module.exports = AlbumsValidator;