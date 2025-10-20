const Joi = require('joi');

const SongPayloadSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.number().required(),
    genre: Joi.string().required(),
    performer: Joi.string().required(),
    duration: Joi.number().positive().optional(),
    albumId: Joi.string().optional().allow(null)
});

const SongQuerySchema = Joi.object({
    title: Joi.string().optional().empty(''),
    performer: Joi.string().optional().empty('')
});

module.exports = {SongPayloadSchema, SongQuerySchema};