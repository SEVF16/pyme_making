import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerRepositoryAbstract } from '../../domain/interfaces/customer-repository.interface';

@Injectable()
export class CustomerRepository implements CustomerRepositoryAbstract {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ where: { id } });
  }

  async findByRut(rut: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ where: { rut } });
  }

  async findByRutAndCompany(rut: string, companyId: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ 
      where: { rut, companyId } 
    });
  }

  async findByCompany(companyId: string): Promise<Customer[]> {
    return await this.customerRepository.find({ 
      where: { companyId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByStatus(status: string): Promise<Customer[]> {
    return await this.customerRepository.find({ 
      where: { status: status as any } 
    });
  }

  async findByStatusAndCompany(status: string, companyId: string): Promise<Customer[]> {
    return await this.customerRepository.find({ 
      where: { status: status as any, companyId },
      order: { createdAt: 'DESC' }
    });
  }

  async findByEmail(email: string, companyId: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ 
      where: { email, companyId } 
    });
  }

  async searchByNameOrEmail(query: string, companyId: string): Promise<Customer[]> {
    return await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere(
        '(LOWER(customer.firstName) LIKE LOWER(:query) OR LOWER(customer.lastName) LIKE LOWER(:query) OR LOWER(customer.email) LIKE LOWER(:query))',
        { query: `%${query}%` }
      )
      .orderBy('customer.createdAt', 'DESC')
      .getMany();
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async create(customerData: Partial<Customer>): Promise<Customer> {
    const customer = this.customerRepository.create(customerData);
    return await this.customerRepository.save(customer);
  }

  async update(id: string, customerData: Partial<Customer>): Promise<Customer> {
    await this.customerRepository.update(id, customerData);
    const updatedCustomer = await this.findById(id);
    
    if (!updatedCustomer) {
      throw new Error(`Cliente con ID ${id} no encontrado`);
    }
    
    return updatedCustomer;
  }

  async delete(id: string): Promise<void> {
    const result = await this.customerRepository.delete(id);
    
    if (result.affected === 0) {
      throw new Error(`Cliente con ID ${id} no encontrado`);
    }
  }

  async countByCompany(companyId: string): Promise<number> {
    return await this.customerRepository.count({ where: { companyId } });
  }

  async findActiveByCompany(companyId: string): Promise<Customer[]> {
    return await this.customerRepository.find({ 
      where: { companyId, status: 'active' },
      order: { createdAt: 'DESC' }
    });
  }
}