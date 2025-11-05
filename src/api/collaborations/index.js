const CollaborationsHandler = require('./handler.js');
const routes = require('./routes.js');

module.exports = {
    name: 'collaborations',
    version: '1.0.0',
    register: async (server, {collaborationsService, playlistsService, validator}) => {
        const collaborationsHandler = new CollaborationsHandler(
            collaborationsService, playlistsService, validator,
        );

        server.route(routes(collaborationsHandler));
    },
};