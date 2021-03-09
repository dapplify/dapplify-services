const chai = require('chai');
const { expect } = chai;
const DataHelper = require('../DataHelper');
const { IdentityHelper } = require('encryptify-lib');

describe('API > User', () => {
  const dataHelper = new DataHelper();

  beforeEach(async () => {
    await dataHelper.initializeData();
  });

  it('should auth a new user', async () => {
    const user = await IdentityHelper.generateIdentity();
    const info = await dataHelper.get(`/v1/users/${user.address}/pin`);
    const signature = IdentityHelper.sign(user.privateKey, info.pin);

    const authInfo = await dataHelper.post(
      '/v1/users/auth',
      {
        address: user.address,
        signature,
        pin: info.pin,
      },
      200
    );

    const me = await dataHelper.get('/v1/users/me', authInfo.token);

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
  });
});
