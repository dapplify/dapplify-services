const crypto = require('crypto');

module.exports = class DocumentBO {
  constructor({ model, identityHelper, dateHelper }, logger) {
    this.logger = logger;
    this.model = model;
    this.identityHelper = identityHelper;
    this.dateHelper = dateHelper;
  }

  clear() {
    return this.model.clear();
  }

  async checkPinSignature(address, pin, signature) {
    address = address.toLowerCase();
    this.logger.debug(
      `[UserBO.checkPinSignature()] Checking pin signature: ${address}/${pin}/${signature}`
    );
    const user = await this.model.getFirstByFilter({ address, pin });

    if (user) {
      this.logger.debug(
        `[UserBO.checkPinSignature()] User found by address and pin: ${address} / ${pin}`
      );
      const recoveredAddress = this.identityHelper
        .recoverAddress(signature, pin)
        .toLowerCase();

      return recoveredAddress === address;
    } else {
      this.logger.debug(
        `[UserBO.checkPinSignature()] User NOT found by address and pin: ${address} / ${pin}`
      );
      this.logger.debug(
        `[UserBO.checkPinSignature()] Checking if it is a new user request: ${address}`
      );

      const userByAddres = await this.getByAddress(address);

      if (!userByAddres) {
        const publicKey = this.identityHelper.recoverPublicKey(signature, pin);
        const compressedPublicKey = this.identityHelper.compressPublicKey(
          publicKey
        );
        const recoveredAddress = this.identityHelper.recoverAddress(
          signature,
          pin
        );

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
          throw {
            status: 409,
            code: 'INVALID_PIN_SIGNATURE',
            recoveredAddress,
            address,
          };
        } else {
          await this.save({ address, publicKey, compressedPublicKey });
          return true;
        }
      } else {
        throw {
          status: 409,
          code: 'INVALID_PIN_SIGNATURE',
        };
      }
    }
  }

  getByAddress(address) {
    address = address.toLowerCase();
    return this.model.getFirstByFilter({ address });
  }

  async save({ address, publicKey, compressedPublicKey }) {
    address = address.toLowerCase();
    publicKey = address.toLowerCase();
    compressedPublicKey = address.toLowerCase();

    const [
      userByAddress,
      userByPublicKey,
      userByCompressedPublicKey,
    ] = await Promise.all([
      this.model.getFirstByFilter({ address }),
      this.model.getFirstByFilter({ publicKey }),
      this.model.getFirstByFilter({ compressedPublicKey }),
    ]);

    if (userByAddress) {
      throw {
        status: 409,
        code: 'ADDRESS_IN_USE',
      };
    }

    if (userByPublicKey) {
      throw {
        status: 409,
        code: 'PUBLICKEY_IN_USER',
      };
    }

    if (userByCompressedPublicKey) {
      throw {
        status: 409,
        code: 'COMPRESSEDPUBLICKEY_IN_USE',
      };
    }

    return this.model.create({
      address,
      publicKey,
      compressedPublicKey,
      createdAt: this.dateHelper.getNow(),
    });
  }

  async updatePin(address) {
    address = address.toLowerCase();
    this.logger.debug(`[UserBO.updatePin()] Updating ${address} pin`);

    const pin = this.identityHelper.generateHash(
      crypto.randomBytes(256).toString('hex')
    );

    this.logger.debug(`[UserBO.updatePin()] New pin to  ${address}: ${pin}`);

    const userByAddress = await this.model.getFirstByFilter({ address });

    if (!userByAddress) {
      this.logger.debug(
        `[UserBO.updatePin()] There is no user using the address ${address}. Pin: ${pin}`
      );

      return { pin };
    } else {
      return this.model.update({ ...userByAddress, pin });
    }
  }
};
