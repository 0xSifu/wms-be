import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';

@Injectable()
export class ScannerService {
  constructor(private readonly prismaService: PrismaService) {}
} 