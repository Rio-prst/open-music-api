const AlbumsHandler = require('./handler.js');
const routes = require('./routes.js');

module.exports = {
    name: 'albums',
    version: '1.0.0',
    register: async (server, {albumsService, storageService, albumsValidator, uploadsValidator}) => {
        const albumsHandler = new AlbumsHandler(albumsService, storageService, albumsValidator, uploadsValidator);
        server.route(routes(albumsHandler));
    }
};