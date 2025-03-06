import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HelperHashService {
  private readonly saltRounds = 10;

  async createHash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.saltRounds);
  }

  async match(hashedValue: string, plaintext: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hashedValue);
  }
} 