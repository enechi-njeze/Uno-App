import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  FeeKind,
  ListingType,
  QuoteBasis,
  TitleType,
} from '../listing.enums';

// A single itemised fee, required as a row (never a JSON blob free-for-all).
export class CreateFeeLineDto {
  @IsEnum(FeeKind)
  kind!: FeeKind;

  @IsOptional()
  @IsString()
  label?: string;

  // Whole naira as a string to preserve bigint precision end-to-end.
  @IsNumberString({ no_symbols: true })
  amountNaira!: string;

  @IsOptional()
  @IsBoolean()
  isPercentage?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  percentageBps?: number;

  @IsOptional()
  @IsBoolean()
  refundable?: boolean;
}

export class CreateListingDto {
  @IsEnum(ListingType)
  type!: ListingType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  agentName?: string;

  // Location — landmark-first. Optionally tie to a gazetteer entry (Step 3);
  // the listing then inherits that landmark's point for radius search.
  @IsOptional()
  @IsUUID()
  gazetteerId?: string;

  @IsString()
  @IsNotEmpty()
  landmark!: string;

  @IsString()
  @IsNotEmpty()
  area!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  lat?: number;

  @IsOptional()
  lng?: number;

  // Money — bigint whole naira as a string. Never a float.
  @IsNumberString({ no_symbols: true })
  priceNaira!: string;

  @IsEnum(QuoteBasis)
  quoteBasis!: QuoteBasis;

  @IsOptional()
  @IsInt()
  @Min(0)
  upfrontYears?: number;

  // Physical
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsNumberString()
  internalAreaSqm?: string;

  @IsOptional()
  @IsNumberString()
  plotSizeSqm?: string;

  @IsOptional()
  @IsNumberString()
  plotCount?: string;

  @IsOptional()
  @IsInt()
  yearBuilt?: number;

  @IsOptional()
  @IsString()
  condition?: string;

  // Trust — title type is REQUIRED at creation (Feature Spec). Verification tier
  // is NOT client-settable; new listings start at 'listed'.
  @IsEnum(TitleType)
  titleType!: TitleType;

  // Fee ledger — at least one itemised fee line is required at creation.
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFeeLineDto)
  feeLines!: CreateFeeLineDto[];
}
