import { PartialType } from '@nestjs/swagger';
import { CreateTycDto } from './create-tyc.dto';

export class UpdateTycDto extends PartialType(CreateTycDto) {}
