import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from "class-validator";

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    title: string;
    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;
    @IsOptional()
    @IsString()
    description?: string;
    @IsOptional()
    @IsString()
    slug?: string;
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;
    @IsString({ each: true })
    @IsArray()
    sizes: string[];
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags?: string[];
    
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];

    @IsIn(['men', 'women', 'kid', 'unisex'])
    genders: string;

}
