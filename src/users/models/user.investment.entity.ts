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
import { IUserInvestment } from '../interfaces/IUserInvestment';
import { User } from './user.entity';

const options = {
  modelName: 'UserInvestment',
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
export class UserInvestment extends Model<IUserInvestment> {
  @Column({
    type: DataType.UUIDV4,
    defaultValue: Sequelize.literal('uuid_generate_v4()'),
    allowNull: false,
    primaryKey: true,
    unique: true,
  })
  id: string;

  @ForeignKey(() => User)
  userId: string;

  @ForeignKey(() => Asset)
  assetId: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: '0',
  })
  balance: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Asset)
  asset: Asset;

  @BelongsTo(() => User)
  user: User;
}
