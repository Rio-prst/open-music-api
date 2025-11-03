const PlaylistsHandler = require('./handler.js');
const routes = require('./routes.js');

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, {playlistsService, songsService, playlistsValidator, playlistSongsValidator}) => {
        const playlistsHandler = new PlaylistsHandler(playlistsService, songsService, playlistsValidator, playlistSongsValidator);
        server.route(routes(playlistsHandler));
    }   
};