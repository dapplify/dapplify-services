const chai = require('chai');
const { expect } = chai;
const DataHelper = require('../DataHelper');

describe('Business > DAppBO', () => {
  const dataHelper = new DataHelper();

  beforeEach(async () => {
    await dataHelper.initializeData();
  });

  beforeEach(async () => {
    await dataHelper.clearData();
  });

  it('should create a new dapp', async () => {
    const dapp = {
      uniqueId: 'uniqueId',
      name: 'mydapp',
      domain: 'www.mydapp.com',
      from: dataHelper.users.user1.address,
      jwt: {
        secret: 'JWT_SECRET',
        expiresIn: '1h',
      },
    };

    dapp.signature = await dataHelper.generateHashAndSign(
      dataHelper.users.user1,
      dapp
    );

    await dataHelper.dappBO.save(dapp);

    try {
      await dataHelper.dappBO.save(dapp);
    } catch (e) {
      console.log(e);
      expect(e.code).to.be.equal('USED_UNIQUEID');
    }
  });

  it('should fail to store a dapp with an invalid signature', async () => {
    const dapp = {
      uniqueId: 'uniqueId',
      name: 'mydapp',
      domain: 'www.mydapp.com',
      from: dataHelper.users.user2.address,
      jwt: {
        secret: 'JWT_SECRET',
        expiresIn: '1h',
      },
    };

    dapp.signature = await dataHelper.generateHashAndSign(
      dataHelper.users.user1,
      dapp
    );

    try {
      await dataHelper.dappBO.save(dapp);
      throw {};
    } catch (e) {
      expect(e.code).to.be.equal('INVALID_FROM');
    }
  });
});
