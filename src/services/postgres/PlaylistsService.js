const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({name}) {
    const query = {
      text: 'INSERT INTO playlists VALUES($1)',
      values: [name],
    };

    await this._pool.query(query);
  }

  async getPlaylists() {
    const query = 'SELECT * FROM playlists';

    await this._pool.query(query);
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }

  // async addSongToPlaylist()
}