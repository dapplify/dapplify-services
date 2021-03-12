const chai = require('chai');
const { expect } = chai;
const DataHelper = require('../DataHelper');
const { IdentityHelper } = require('encryptify-lib');

describe('API > Addresses', () => {
  let dataHelper = new DataHelper();

  beforeEach(async () => {
    await dataHelper.initializeData();
  });

  it('should create a new address detail', async () => {
    const address = await IdentityHelper.generateIdentity();
    const token = await dataHelper.getUserToken(dataHelper.users.user1);
    const dapp = await dataHelper.createDefaultDApp(dataHelper.users.user1);

    const addressDetail = {
      address: address.address,
      name: 'User',
      email: 'user@domain.com',
      imageUrl: 'imageUrl',
      roles: ['admin'],
    };

    const newEntity = await dataHelper.post(
      '/v1/addresses',
      addressDetail,
      201,
      token,
      dapp.uniqueId
    );

    expect(newEntity.roles[0]).to.be.equal('admin', 'Fail to check the role');
    expect(newEntity.address).to.be.equal(
      address.address.toLowerCase(),
      'Fail to check address'
    );
    expect(newEntity.name).to.be.equal('User', 'Fail to check address');
    expect(newEntity.email).to.be.equal(
      'user@domain.com',
      'Fail to check email'
    );
    expect(newEntity.imageUrl).to.be.equal(
      'imageUrl',
      'Fail to check imageUrl'
    );
    expect(newEntity.createdBy).to.be.equal(
      dataHelper.users.user1.address.toLowerCase(),
      'Fail to check createdBy'
    );
  });

  it('should create (and update) a new address detail with default role (user is not the dapp owner)', async () => {
    const dapp = await dataHelper.createDefaultDApp(dataHelper.users.user1);

    const address = await IdentityHelper.generateIdentity();
    const token = await dataHelper.getUserToken(address);

    const addressDetail = {
      address: address.address,
      name: 'User',
      email: 'user@domain.com',
      imageUrl: 'imageUrl',
      roles: ['admin'],
    };

    const newEntity = await dataHelper.post(
      '/v1/addresses',
      addressDetail,
      201,
      token,
      dapp.uniqueId
    );

    const updatedEntity = await dataHelper.put(
      `/v1/addresses/${address.address}`,
      {
        ...addressDetail,
        name: 'New Name',
      },
      200,
      token,
      dapp.uniqueId
    );

    expect(newEntity.roles[0]).to.be.equal('user', 'Fail to check the role');
    expect(newEntity.address).to.be.equal(
      address.address.toLowerCase(),
      'Fail to check address'
    );
    expect(newEntity.name).to.be.equal('User', 'Fail to check address');
    expect(updatedEntity.name).to.be.equal(
      'New Name',
      'Fail to check address #updatedEntity'
    );
    expect(newEntity.email).to.be.equal(
      'user@domain.com',
      'Fail to check email'
    );
    expect(newEntity.imageUrl).to.be.equal(
      'imageUrl',
      'Fail to check imageUrl'
    );
    expect(newEntity.createdBy).to.be.equal(
      address.address.toLowerCase(),
      'Fail to check createdBy'
    );
  });

  it('should fail to create a new address if the current user is not the same', async () => {
    const dapp = await dataHelper.createDefaultDApp(dataHelper.users.user1);

    const address = await IdentityHelper.generateIdentity();
    const otherAddress = await IdentityHelper.generateIdentity();
    const token = await dataHelper.getUserToken(address);

    const addressDetail = {
      address: otherAddress.address,
      name: 'User',
      email: 'user@domain.com',
      imageUrl: 'imageUrl',
      roles: ['admin'],
    };

    await dataHelper.post(
      '/v1/addresses',
      addressDetail,
      401,
      token,
      dapp.uniqueId
    );
  });

  it('should fail to update an address from another account but success from an owner', async () => {
    const dapp = await dataHelper.createDefaultDApp(dataHelper.users.user1);

    const address1 = await IdentityHelper.generateIdentity();
    const address2 = await IdentityHelper.generateIdentity();
    const owner = await dataHelper.getUserToken(dataHelper.users.user1);
    const token1 = await dataHelper.getUserToken(address1);
    const token2 = await dataHelper.getUserToken(address2);

    const addressDetail = {
      address: address1.address,
      name: 'User',
      email: 'user@domain.com',
      imageUrl: 'imageUrl',
      roles: ['admin'],
    };

    await dataHelper.post(
      '/v1/addresses',
      addressDetail,
      201,
      token1,
      dapp.uniqueId
    );

    await dataHelper.put(
      `/v1/addresses/${address1.address}`,
      {
        ...addressDetail,
        name: 'New Name',
      },
      401,
      token2,
      dapp.uniqueId
    );

    await dataHelper.put(
      `/v1/addresses/${address1.address}`,
      {
        ...addressDetail,
        name: 'New Name',
      },
      200,
      owner,
      dapp.uniqueId
    );
  });
});
