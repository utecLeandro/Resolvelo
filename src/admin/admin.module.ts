import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminRolesController } from './admin-roles.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminPublicationsController } from './admin-publications.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';

@Module({
  controllers: [
    AdminController,
    AdminRolesController,
    AdminUsersController,
    AdminPublicationsController,
  ],
  providers: [AdminService, PrismaService, EncryptionService],
})
export class AdminModule {}
