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
import { Asset } from '../../chain-abstraction/models/asset.entity';
import { IInvestmentAddress } from '../interfaces/IInvestmentAddress';

const options = {
  modelName: 'InvestmentAddress',
  indexes: [
    {
      unique: true,
      fields: ['id'],
    },
    {
      fields: ['assetId'],
    },
  ],
};
@Table(options)
export class InvestmentAddress extends Model<IInvestmentAddress> {
  @Column({
    type: DataType.UUIDV4,
    defaultValue: Sequelize.literal('uuid_generate_v4()'),
    allowNull: false,
    primaryKey: true,
    unique: true,
  })
  id: string;

  @ForeignKey(() => Asset)
  assetId: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  address: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Asset)
  asset: Asset;
}
