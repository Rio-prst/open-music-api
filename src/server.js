require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const albums = require('./api/albums');
const songs = require('./api/songs');
const playlists = require('./api/playlists');
const AlbumsService = require('./services/postgres/AlbumsService.js');
const SongsService = require('./services/postgres/SongsService.js');
const AlbumsValidator = require('./validator/albums/index.js');
const SongsValidator = require('./validator/songs/index.js');
const ClientError = require('./exceptions/ClientError.js');
const AuthenticationsValidator = require('./validator/authentications/index.js');
const PlaylistsValidator = require('./validator/playlists/index.js');
const PlaylistSongsValidator = require('./validator/playlistSongs/index.js');
const TokenManager = require('./tokenize/TokenManager.js');
const PlaylistsService = require('./services/postgres/PlaylistsService.js');
const CollaborationsService = require('./services/postgres/CollaborationsSercvice.js');

const init = async () => {
    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const playlistsService = new PlaylistsService();
    const collaborationsService = new CollaborationsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*']
            }
        }
    });

    await server.register([
        {
            plugin: Jwt
        }
    ]);

    server.auth.strategy('notesapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            }
        })
    })

    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsService,
                validator: AlbumsValidator
            }
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator
            }
        }, 
        {
            plugin: playlists,
            options: {
                playlistsService,
                songsService,
                playlistsValidator: PlaylistsValidator,
                playlistSongsValidator: PlaylistSongsValidator,
            },
        }
    ]);

    server.ext('onPreResponse', (request, h) => {
        const {response} = request;

        if (response instanceof Error) {
            if (response instanceof ClientError) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message
            });

            newResponse.code(response.statusCode);
                return newResponse;
            }

            if (!response.isServer) {
                return h.continue;
            }

            const newResponse = h.response({
                status: 'error',
                message: 'Terjadi kegagalan pada server kami'
            });

            newResponse.code(500);
            console.log(newResponse);
            return newResponse;
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
}

init();