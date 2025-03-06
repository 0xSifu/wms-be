import { Controller } from '@nestjs/common';
import { ScannerService } from '../services/scanner.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Scanner')
@Controller('scanner')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}
} 