import { Injectable } from '@nestjs/common';
import { hdkey } from 'ethereumjs-wallet';
import { generateMnemonic, mnemonicToSeed } from 'bip39';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}
  generateUserMnemonic(): string {
    return generateMnemonic();
  }
  async generateAddress(userId: string) {
    const seedPhrase =
      'beauty polar silent opera drink all patient join enact olympic hundred sting';

    if (seedPhrase) {
      const seed = await mnemonicToSeed(seedPhrase);

      const hdwallet = hdkey.fromMasterSeed(seed);

      const masterPrivateKey = hdwallet.privateExtendedKey();
      const masterPublicKey = hdwallet.publicExtendedKey();

      // const lastIndex = 0;
      // const coinType = network === 'mainnet' ? 60 : 1;
      // const wallet = hdwallet
      //   .derivePath(`m/84'/${coinType}'/0'/0/${lastIndex}`)
      //   .getWallet();
    }
  }
}
