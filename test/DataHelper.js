const BOFactory = require('../src/business/BOFactory');
const Logger = require('../src/config/Logger');
const Database = require('../src/config/Database.js');
const request = require('supertest');
const { IdentityHelper } = require('encryptify-lib');

Database.connect();

module.exports = class DataHelper {
  constructor() {
    this.logger = new Logger();
    this.dappBO = BOFactory.getDAppBO(this.logger);
    this.addressDetailBO = BOFactory.getAddressDetailBO(this.logger);
    this.userBO = BOFactory.getUserBO(this.logger);
    this.server = require('../src/index');

    this.initializeData();
  }

  async initializeData() {
    await this.clearData();

    return Promise.all([this.initializeUsers()]);
  }

  async initializeUsers() {
    this.users = {
      user1: await IdentityHelper.generateIdentity(),
      user2: await IdentityHelper.generateIdentity(),
    };
  }

  async generateHashAndSign(identity, object) {
    const hash = IdentityHelper.generateHash(JSON.stringify(object));
    return IdentityHelper.sign(identity.privateKey, hash);
  }

  clearData() {
    return Promise.all([
      this.dappBO.clear(),
      this.userBO.clear(),
      this.addressDetailBO.clear(),
    ]);
  }

  async createDefaultDApp(user) {
    const token = await this.getUserToken(user);
    const dapp = {
      uniqueId: 'DAPP_ID',
      name: 'mydapp',
      domain: 'www.mydapp.com',
      from: user.address.toLowerCase(),
      jwt: {
        secret: 'JWT_SECRET',
        expiresIn: '1h',
      },
    };

    dapp.signature = await this.generateHashAndSign(user, dapp);

    return this.post('/v1/dapps', dapp, 201, token);
  }

  async getUserToken(user) {
    const info = await this.get(`/v1/users/${user.address}/pin`);
    const signature = IdentityHelper.sign(user.privateKey, info.pin);

    const authInfo = await this.post(
      '/v1/users/auth',
      {
        address: user.address,
        signature,
        pin: info.pin,
      },
      200
    );

    return authInfo.token;
  }

  async getDAppUserToken(uniqueId, user) {
    const info = await this.get(
      `/v1/dapps/${uniqueId}/users/${user.address}/pin`
    );
    const signature = IdentityHelper.sign(user.privateKey, info.pin);

    const authInfo = await this.post(
      `/v1/dapps/${uniqueId}/users/auth`,
      {
        address: user.address,
        signature,
        pin: info.pin,
      },
      200
    );

    return authInfo.token;
  }

  async post(endpoint, data, expected, token) {
    const chain = request(this.server)
      .post(endpoint)
      .send(data)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(expected || 200);

    let res = null;

    if (token) {
      res = await chain.set('Authorization', `Bearer ${token}`);
    } else {
      res = await chain;
    }

    return res.body;
  }

  async put(endpoint, data, expected, token) {
    const chain = request(this.server)
      .put(endpoint)
      .send(data)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(expected || 200);

    let res = null;

    if (token) {
      res = await chain.set('Authorization', `Bearer ${token}`);
    } else {
      res = await chain;
    }

    return res.body;
  }

  async get(endpoint, token, expected) {
    const chain = request(this.server)
      .get(endpoint)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(expected || 200);

    let res = null;

    if (token) {
      res = await chain.set('Authorization', `Bearer ${token}`);
    } else {
      res = await chain;
    }

    return res.body;
  }
};
