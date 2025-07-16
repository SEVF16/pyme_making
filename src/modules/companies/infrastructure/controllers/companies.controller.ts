import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import { CreateCompanyDto } from '../../application/dto/create-company.dto';
import { UpdateCompanyDto } from '../../application/dto/update-company.dto';
import { CreateSiiConfigurationDto } from '../../application/dto/create-sii-configuration.dto';
import { CompanyResponseDto } from '../../application/dto/company-response.dto';
import { CompanyService } from '../../application/services/companies.service';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCompany(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    return await this.companyService.createCompany(createCompanyDto);
  }

  @Get()
  async getAllCompanies(): Promise<CompanyResponseDto[]> {
    return await this.companyService.getAllCompanies();
  }

  @Get('rut/:rut')
  async getCompanyByRut(@Param('rut') rut: string): Promise<CompanyResponseDto | null> {
    return await this.companyService.getCompanyByRut(rut);
  }

  @Get(':id')
  async getCompanyById(@Param('id', ParseUUIDPipe) id: string): Promise<CompanyResponseDto> {
    return await this.companyService.getCompanyById(id);
  }

  @Get(':id/configurations')
  async getCompanyWithConfigurations(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return await this.companyService.getCompanyWithConfigurations(id);
  }

  @Put(':id')
  async updateCompany(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return await this.companyService.updateCompany(id, updateCompanyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCompany(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.companyService.deleteCompany(id);
  }

  @Post(':id/sii-configuration')
  @HttpCode(HttpStatus.CREATED)
  async configureSii(
    @Param('id', ParseUUIDPipe) companyId: string,
    @Body() configDto: CreateSiiConfigurationDto,
  ): Promise<any> {
    configDto.companyId = companyId;
    return await this.companyService.configureSii(configDto);
  }
}