import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async createAndSave(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(id: string, data: Partial<User>) {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string) {
    await this.repo.softDelete(id);
  }

  async findOne(data: { where: { email?: string; id?: string } }) {
    return this.repo.findOne(data);
  }
}
