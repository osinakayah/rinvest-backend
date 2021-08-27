import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class BalanceModel extends Model {
  @Column
  freeBalance: string;

  @Column
  stakedAmount: string;
}
