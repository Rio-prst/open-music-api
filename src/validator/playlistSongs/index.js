const InvariantError = require('../../exceptions/InvariantError.js');
const PlaylistSongsPaylaodSchema = require('./schema.js');

const PlaylistSongsValidator = {
  validatePlaylistSongsPayload: (payload) => {
      const validationResult = PlaylistSongsPaylaodSchema.validate(payload);

      if (validationResult.error) {
        throw new InvariantError(validationResult.error.message);
      }
  }
}

module.exports = PlaylistSongsValidator;
