import {
  Table,
  Column,
  Model,
  DataType,
  Sequelize,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { IAssetNairaRate } from '../interfaces/IAssetNairaRate';

const options = {
  modelName: 'AssetNairaRate',
  indexes: [
    {
      unique: true,
      fields: ['id'],
    },
  ],
};
@Table(options)
export class AssetNairaRate extends Model<IAssetNairaRate> {
  @Column({
    type: DataType.UUIDV4,
    defaultValue: Sequelize.literal('uuid_generate_v4()'),
    allowNull: false,
    primaryKey: true,
    unique: true,
  })
  id: string;

  @Column({
    allowNull: false,
    type: DataType.JSON,
  })
  rates: any;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  baseAsset: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
