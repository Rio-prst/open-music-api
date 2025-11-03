const Joi = require('joi');

const PlaylistSongsPaylaodSchema = Joi.object({
    songId: Joi.string().required(),
});

module.exports = PlaylistSongsPaylaodSchema;