import { Controller, Get, Query } from '@nestjs/common';
import { AmoService } from './amo.service';
import { FindContactDto } from './find-contact.dto';

@Controller('amo')
export class AmoController {
  constructor(private readonly amoService: AmoService) {}

  @Get()
  async createLead(@Query() findContactDto: FindContactDto) {
    return this.amoService.upsetContactAndCreateLead(findContactDto);
  }
}
