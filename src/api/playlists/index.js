const PlaylistsHandler = require('./handler.js');
const routes = require('./routes.js');

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, {playlistsService, songsService, collaborationsService, playlistsValidator, playlistSongsValidator}) => {
        const playlistsHandler = new PlaylistsHandler(playlistsService, songsService, collaborationsService, playlistsValidator, playlistSongsValidator);
        server.route(routes(playlistsHandler));
    }   
};