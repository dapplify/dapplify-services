const chai = require('chai');
const { expect } = chai;
const DataHelper = require('../DataHelper');
const { IdentityHelper } = require('encryptify-lib');

describe('API > User', () => {
  const dataHelper = new DataHelper();

  beforeEach(async () => {
    await dataHelper.initializeData();
  });

  it('should auth a new user, persists an account and auth again with a persisted pin', async () => {
    const user = await IdentityHelper.generateIdentity();
    let info = await dataHelper.get(`/v1/users/${user.address}/pin`);
    let signature = IdentityHelper.sign(user.privateKey, info.pin);

    let authInfo = await dataHelper.post(
      '/v1/users/auth',
      {
        address: user.address,
        signature,
        pin: info.pin,
      },
      200
    );

    let me = await dataHelper.get('/v1/users/me', authInfo.token);

    expect(me.address).to.be.equal(
      user.address.toLowerCase(),
      'Fail to check address'
    );
    expect(me.publicKey).to.be.equal(
      user.publicKey.toLocaleLowerCase(),
      'Fail to check publicKey'
    );
    expect(me.compressedPublicKey).to.be.equal(
      user.compressedPublicKey.toLocaleLowerCase(),
      'Fail to check compressedPublicKey'
    );

    info = await dataHelper.get(`/v1/users/${user.address}/pin`);
    signature = IdentityHelper.sign(user.privateKey, info.pin);

    authInfo = await dataHelper.post(
      '/v1/users/auth',
      {
        address: user.address,
        signature,
        pin: info.pin,
      },
      200
    );

    me = await dataHelper.get('/v1/users/me', authInfo.token);

    expect(me.address).to.be.equal(
      user.address.toLowerCase(),
      'Fail to check address #2'
    );
    expect(me.publicKey).to.be.equal(
      user.publicKey.toLocaleLowerCase(),
      'Fail to check publicKey #2'
    );
    expect(me.compressedPublicKey).to.be.equal(
      user.compressedPublicKey.toLocaleLowerCase(),
      'Fail to check compressedPublicKey #2'
    );
  });

  it('should auth a new user in a dapp', async () => {
    const regularUser1 = await IdentityHelper.generateIdentity();
    const regularUser2 = await IdentityHelper.generateIdentity();
    const dapp = await dataHelper.createDefaultDApp(dataHelper.users.user1);

    const { uniqueId } = dapp;

    const infoRegulerUser1 = await dataHelper.get(
      `/v1/users/${regularUser1.address}/pin`,
      null,
      200,
      uniqueId
    );
    const infoRegulerUser2 = await dataHelper.get(
      `/v1/users/${regularUser2.address}/pin`,
      null,
      200,
      uniqueId
    );

    const signatureRegularUser1 = IdentityHelper.sign(
      regularUser1.privateKey,
      infoRegulerUser1.pin
    );
    const signatureRegularUser2 = IdentityHelper.sign(
      regularUser2.privateKey,
      infoRegulerUser2.pin
    );

    const authRegularUser1 = await dataHelper.post(
      '/v1/users/auth',
      {
        address: regularUser1.address,
        signature: signatureRegularUser1,
        pin: infoRegulerUser1.pin,
      },
      200,
      null,
      uniqueId
    );

    const authRegularUser2 = await dataHelper.post(
      '/v1/users/auth',
      {
        address: regularUser2.address,
        signature: signatureRegularUser2,
        pin: infoRegulerUser2.pin,
      },
      200,
      null,
      uniqueId
    );

    const parsedUser1Token = dataHelper.jwtHelper.decodeToken(
      authRegularUser1.token,
      dapp.jwt
    );

    const parsedUser2Token = dataHelper.jwtHelper.decodeToken(
      authRegularUser2.token,
      dapp.jwt
    );

    expect(parsedUser1Token.address.toLowerCase()).to.be.equal(
      regularUser1.address.toLowerCase()
    );
    expect(parsedUser1Token.uniqueId).to.be.equal(dapp.uniqueId);
    expect(parsedUser2Token.address.toLowerCase()).to.be.equal(
      regularUser2.address.toLowerCase()
    );
    expect(parsedUser2Token.uniqueId).to.be.equal(dapp.uniqueId);
  });
});
