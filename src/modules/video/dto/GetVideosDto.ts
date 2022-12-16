import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class GetVideosDto {
  @IsOptional()
  @IsNumber()
  offset = 0;

  @IsOptional()
  @IsNumber()
  limit = 100;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsIn(['updateDate', 'createDate', 'state'])
  orderBy: 'updateDate' | 'createDate' | 'state' = 'updateDate';
}
