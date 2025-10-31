/**
 * SalesOrchestrationController - Infrastructure Layer
 *
 * HTTP endpoint for processing sales with invoice creation and stock management.
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProcessSaleUseCase } from '../../application/use-cases/process-sale.use-case';
import { ProcessSaleDto, ProcessSaleResponseDto } from '../../application/dto/process-sale.dto';

@ApiTags('Sales Orchestration')
@Controller('sales')
// @UseGuards(JwtAuthGuard, TenantGuard) // Uncomment when auth is ready
export class SalesOrchestrationController {
  private readonly logger = new Logger(SalesOrchestrationController.name);

  constructor(private readonly processSaleUseCase: ProcessSaleUseCase) {}

  @Post('process')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Process a sale',
    description: `
      Orchestrates the complete sale process:
      1. Validates product existence and status
      2. Validates stock availability
      3. Validates prices against catalog
      4. Creates invoice with items
      5. Deducts stock automatically
      6. Returns complete sale information

      On failure, automatically compensates (rollback) all changes.
    `,
  })
  // @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Sale processed successfully',
    type: ProcessSaleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Insufficient stock or business rule violation',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - sale processing failed',
  })
  async processSale(@Body() dto: ProcessSaleDto): Promise<ProcessSaleResponseDto> {
    this.logger.log(`Processing sale for company: ${dto.companyId}`);

    try {
      const result = await this.processSaleUseCase.execute(dto);

      this.logger.log(`Sale processed successfully: ${result.saleId}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to process sale: ${error.message}`, error.stack);
      throw error;
    }
  }
}
