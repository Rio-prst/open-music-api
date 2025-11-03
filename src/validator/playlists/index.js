const InvariantError = require('../../exceptions/InvariantError.js');
const SongPayloadSchema = require('./schema.js');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
      const validationResult = SongPayloadSchema.validate(payload);

      if (validationResult.error) {
        throw new InvariantError(validationResult.error.message);
      }
  }
}

module.exports = PlaylistsValidator;
