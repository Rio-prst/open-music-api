const InvariantError = require('../../exceptions/InvariantError.js');
const {CollaborationPayloadSchema} = require('./schema.js');

const CollaborationsValidator = {
    validateCollaboratorPayload: (payload) => {
        const validationResult = CollaborationPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
};

module.exports = CollaborationsValidator;