require('dotenv').config();
const Hapi = require('@hapi/hapi');
const {Pool} = require('pg');
const Jwt = require('@hapi/jwt');
const albums = require('./api/albums');
const songs = require('./api/songs');
const playlists = require('./api/playlists');
const users = require('./api/users');
const authentications = require('./api/authentications');
const collaborations = require('./api/collaborations');
const AlbumsService = require('./services/postgres/AlbumsService.js');
const SongsService = require('./services/postgres/SongsService.js');
const UsersService = require('./services/postgres/UsersService.js');
const AuthenticationsService = require('./services/postgres/AuthenticationsService.js');
const PlaylistsService = require('./services/postgres/PlaylistsService.js');
const CollaborationsService = require('./services/postgres/CollaborationsService.js');
const AlbumsValidator = require('./validator/albums/index.js');
const SongsValidator = require('./validator/songs/index.js');
const ClientError = require('./exceptions/ClientError.js');
const UsersValidator = require('./validator/users/index.js');
const AuthenticationsValidator = require('./validator/authentications/index.js');
const PlaylistsValidator = require('./validator/playlists/index.js');
const PlaylistSongsValidator = require('./validator/playlistSongs/index.js');
const CollaborationsValidator = require('./validator/collaborations/index.js');
const TokenManager = require('./tokenize/TokenManager.js');

const init = async () => {
    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();

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
                collaborationsService,
                playlistsValidator: PlaylistsValidator,
                playlistSongsValidator: PlaylistSongsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            }
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            }
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistsService,
                validator: CollaborationsValidator
            }
        }
    ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
    
            if (response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                });
                newResponse.code(response.statusCode);
                return newResponse;
            }

            if (!response.isServer) {
                return h.continue;
            }
            const newResponse = h.response({
                status: 'error',
                message: 'terjadi kegagalan pada server kami',
            });
            newResponse.code(500);
            return newResponse;
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
}

init();