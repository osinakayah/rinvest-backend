import {
  Table,
  Column,
  Model,
  DataType,
  Sequelize,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
} from 'sequelize-typescript';
import { ITransaction } from '../interfaces/ITransaction';
import { Asset } from '../../chain-abstraction/models/asset.entity';
import { User } from './user.entity';

const options = {
  modelName: 'Transactions',
  indexes: [
    {
      unique: true,
      fields: ['id'],
    },
    {
      fields: ['assetId'],
    },
    {
      fields: ['userId'],
    },
  ],
};
@Table(options)
export class Transactions extends Model<ITransaction> {
  @Column({
    type: DataType.UUIDV4,
    defaultValue: Sequelize.literal('uuid_generate_v4()'),
    allowNull: false,
    primaryKey: true,
    unique: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  userId: string;

  @ForeignKey(() => Asset)
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  assetId: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  transactionType: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  amount: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  destinationAddress: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  transactionStatus: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  network: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  txHash: string;

  @Column({
    allowNull: false,
    type: DataType.JSON,
  })
  metaData: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Asset)
  asset: Asset;

  @BelongsTo(() => User)
  user: User;
}
