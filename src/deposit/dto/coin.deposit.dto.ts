import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CoinDepositDto {
  @IsNumber()
  readonly amount: number;

  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @IsNotEmpty()
  @IsString()
  readonly code: string;

  @IsNotEmpty()
  @IsString()
  readonly txHash: string;

  @IsNotEmpty()
  @IsString()
  readonly chain: string;
}
