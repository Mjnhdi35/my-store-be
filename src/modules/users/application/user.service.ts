import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { UserRepository } from '../infra/user.repository';
import { CreateUserDto } from '../presentation/dto/create-user.dto';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepo: UserRepository) {}

  onModuleInit() {
    this.logger.log('UserService initialized');
  }

  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userRepo.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const user = await this.userRepo.createAndSave({
      email: normalizedEmail,
    });
    this.logger.log(`User created: ${user.id}`);
    return user;
  }

  findAll() {
    this.logger.debug('findAll called');
    return Promise.resolve(`This action returns all users`);
  }

  findOne(id: number) {
    this.logger.debug(`findOne called with id: ${id}`);
    return Promise.resolve(`This action returns a #${id} user`);
  }

  update(id: number) {
    this.logger.debug(`update called with id: ${id}`);
    return Promise.resolve(`This action updates a #${id} user`);
  }

  remove(id: number) {
    this.logger.debug(`remove called with id: ${id}`);
    return Promise.resolve(`This action removes a #${id} user`);
  }
}
