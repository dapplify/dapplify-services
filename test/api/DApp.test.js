const chai = require('chai');
const { expect } = chai;
const DataHelper = require('../DataHelper');

describe('API > DApp', () => {
  let dataHelper = new DataHelper();

  const saveItem = async (user, token, { uniqueId, name, domain, jwt }) => {
    const newEntity = {
      uniqueId,
      name,
      domain,
      from: user.address.toLowerCase(),
      jwt,
    };

    newEntity.signature = await dataHelper.generateHashAndSign(user, newEntity);

    return await dataHelper.post('/v1/dapps', newEntity, 201, token);
  };

  beforeEach(async () => {
    await dataHelper.initializeData();
  });

  it('should create a new dapp', async () => {
    const token = await dataHelper.getUserToken(dataHelper.users.user1);
    const savedItem = await saveItem(dataHelper.users.user1, token, {
      uniqueId: 'uniqueId',
      name: 'mydapp',
      domain: 'www.mydapp.com',
      jwt: {
        secret: 'JWT_SECRET',
        expiresIn: '1h',
      },
    });

    const recoveredObject = await dataHelper.get('/v1/dapps/uniqueId', token);

    expect(recoveredObject.uniqueId).to.be.equal('uniqueId');
    expect(recoveredObject.name).to.be.equal('mydapp');
    expect(recoveredObject.domain).to.be.equal('www.mydapp.com');
    expect(recoveredObject.from.toLowerCase()).to.be.equal(
      dataHelper.users.user1.address.toLowerCase()
    );
    expect(recoveredObject.signature).to.be.equal(savedItem.signature);
    expect(recoveredObject.jwt.secret).to.be.equal(savedItem.jwt.secret);
    expect(recoveredObject.jwt.expiresIn).to.be.equal(savedItem.jwt.expiresIn);
  });

  it('should authenticate a user in a dapp', async () => {
    const token = await dataHelper.getUserToken(dataHelper.users.user1);
    const savedItem = await saveItem(dataHelper.users.user1, token, {
      uniqueId: 'uniqueId',
      name: 'mydapp',
      domain: 'www.mydapp.com',
      jwt: {
        secret: '0a391f10-f8bd-47c2-b7da-9aa74a1ca4fb',
        expiresIn: '1h',
      },
    });

    const dappUserToken = await dataHelper.getDAppUserToken(
      savedItem.uniqueId,
      dataHelper.users.user2
    );

    console.log(dappUserToken);
  });

  it('should fail to save a dapp with a user and get it using another user', async () => {
    const user1Token = await dataHelper.getUserToken(dataHelper.users.user1);
    const user2Token = await dataHelper.getUserToken(dataHelper.users.user2);
    await saveItem(dataHelper.users.user1, user1Token, {
      uniqueId: 'uniqueId',
      name: 'mydapp',
      domain: 'www.mydapp.com',
      jwt: {
        secret: 'JWT_SECRET',
        expiresIn: '1h',
      },
    });

    await dataHelper.get('/v1/dapps/uniqueId', user2Token, 404);
  });
});
