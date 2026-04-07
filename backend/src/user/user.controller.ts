import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermission } from 'src/auth/decorators';
import {
  AssignRolesRequestDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UpsertUserSkillsDto,
} from './dto/user.req.dto';
import {
  ErrorResponseDto,
  GetAllUsersResponseDto,
  UserResponseDto,
} from './dto/user.res.dto';
import { UserService } from './user.service';

@ApiBearerAuth('access-token')
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  @Post('create')
  @RequirePermission('users:create')
  @ApiOperation({ summary: 'Crea un nuevo usuario' })
  @ApiBody({ type: CreateUserRequestDto })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  create(@Body() dto: CreateUserRequestDto) {
    return this.service.create(dto);
  }

  // ─── READ ALL ─────────────────────────────────────────────────────────────
  @Get('all')
  @RequirePermission('users:read')
  @ApiOperation({ summary: 'Obtiene todos los usuarios' })
  @ApiResponse({ status: 200, type: GetAllUsersResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findAll() {
    return this.service.findAll();
  }

  // ─── READ ONE ─────────────────────────────────────────────────────────────
  @Get(':id')
  @RequirePermission('users:read')
  @ApiOperation({ summary: 'Obtiene un usuario por ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @Patch(':id')
  @RequirePermission('users:update')
  @ApiOperation({ summary: 'Actualiza un usuario' })
  @ApiBody({ type: UpdateUserRequestDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateUserRequestDto) {
    return this.service.update(+id, dto);
  }

  // ─── UPLOAD AVATAR ────────────────────────────────────────────────────────
  @Post(':id/avatar')
  @RequirePermission('users:update')
  @ApiOperation({ summary: 'Sube o reemplaza el avatar de un usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadAvatar(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(png|jpe?g|gif|webp)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.service.uploadAvatar(+id, file);
  }

  // ─── UPSERT SKILLS ────────────────────────────────────────────────────────
  @Put(':id/skills')
  @RequirePermission('users:update')
  @ApiOperation({ summary: 'Reemplaza las habilidades de un usuario' })
  @ApiBody({ type: UpsertUserSkillsDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  upsertSkills(@Param('id') id: string, @Body() dto: UpsertUserSkillsDto) {
    return this.service.upsertSkills(+id, dto);
  }

  // ─── ASSIGN ROLES ─────────────────────────────────────────────────────────
  @Patch(':id/roles')
  @RequirePermission('users:update')
  @ApiOperation({ summary: 'Asigna roles a un usuario' })
  @ApiBody({ type: AssignRolesRequestDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  assignRoles(@Param('id') id: string, @Body() dto: AssignRolesRequestDto) {
    return this.service.assignRoles(+id, dto);
  }
}
