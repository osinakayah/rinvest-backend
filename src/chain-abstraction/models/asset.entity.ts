import {
  Table,
  Column,
  Model,
  DataType,
  Sequelize,
} from 'sequelize-typescript';
import { IAsset } from '../interfaces/IAsset';

@Table
export class Asset extends Model<IAsset> {
  @Column({
    type: DataType.UUIDV4,
    defaultValue: Sequelize.literal('uuid_generate_v4()'),
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  name: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  code: string;

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  decimals: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  contractAddress: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  matchingAsset: boolean;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  color: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  coinGeckoId: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  chain: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  type: string;

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isEnable: string;
}
