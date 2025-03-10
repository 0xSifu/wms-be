import { ApiProperty } from '@nestjs/swagger';

export class ChartDataPoint {
  @ApiProperty({ description: 'Label for the data point (e.g., date, hour, category)' })
  label: string;

  @ApiProperty({ description: 'Value for the data point' })
  value: number;
}

export class StatisticsResponseDto {
  @ApiProperty({ description: 'Total number of products in the system' })
  totalProducts: number;

  @ApiProperty({ description: 'Total number of tags that have been scanned' })
  totalTagsScanned: number;

  @ApiProperty({ description: 'Total number of tags not synced to any product' })
  totalTagsUnsync: number;

  @ApiProperty({ description: 'Total number of transactions recorded' })
  totalTransactions: number;

  @ApiProperty({ description: 'Total number of products with tags' })
  productsWithTags: number;

  @ApiProperty({ description: 'Total number of products without tags' })
  productsWithoutTags: number;

  @ApiProperty({ description: 'Average number of scans per tag' })
  averageScansPerTag: number;

  @ApiProperty({ description: 'Most recent scan timestamp' })
  lastScanTimestamp: Date | null;

  @ApiProperty({ description: 'Most scanned tag' })
  mostScannedTag: {
    epc: string;
    scanCount: number;
  } | null;

  @ApiProperty({ description: 'Product with most tags' })
  productWithMostTags: {
    productName: string;
    tagCount: number;
  } | null;

  @ApiProperty({ description: 'Transactions in the last 24 hours' })
  transactionsLast24Hours: number;

  @ApiProperty({ description: 'Tags added in the last 24 hours' })
  newTagsLast24Hours: number;

  @ApiProperty({ description: 'Daily transaction counts for the last 7 days' })
  dailyTransactions: ChartDataPoint[];

  @ApiProperty({ description: 'Hourly transaction distribution for today' })
  hourlyTransactions: ChartDataPoint[];

  @ApiProperty({ description: 'Product distribution by type' })
  productTypeDistribution: ChartDataPoint[];

  @ApiProperty({ description: 'Tag scan trends by hour' })
  tagScanTrends: ChartDataPoint[];
} 