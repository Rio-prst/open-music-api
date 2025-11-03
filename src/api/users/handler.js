const autoBind = require("auto-bind");

class UsersHandler {
  constructor(service, validator) {
    autoBind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const {username, password, fullname} = request.paylaod;

    const userId = await this._service.addUser({username, password, fullname});

    const response = h.response({
      status: 'success',
      data: {
        userId
      }
    });

    response.code(201);
    return response;
   }
}

module.exports = UsersHandler;