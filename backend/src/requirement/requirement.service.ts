import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectMemberRole, RequirementPriority, RequirementStatus, RequirementType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChangeRequirementStatusReqDto,
  CreateRequirementReqDto,
  UpdateRequirementReqDto,
} from './dto/requirement.req.dto';

@Injectable()
export class RequirementService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeCreatedBy = {
    createdBy: { select: { id: true, nombre: true } },
  };

  findAll(
    projectId: number,
    filters: {
      type?: RequirementType;
      status?: RequirementStatus;
      priority?: RequirementPriority;
    },
  ) {
    return this.prisma.requirement.findMany({
      where: {
        projectId,
        activo: true,
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
      },
      include: this.includeCreatedBy,
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(projectId: number, id: number) {
    const req = await this.prisma.requirement.findFirst({
      where: { id, projectId, activo: true },
      include: this.includeCreatedBy,
    });
    if (!req) throw new NotFoundException(`Requisito #${id} no encontrado`);
    return req;
  }

  create(projectId: number, dto: CreateRequirementReqDto, createdById: number) {
    return this.prisma.requirement.create({
      data: {
        projectId,
        type: dto.type,
        subtype: dto.subtype ?? null,
        title: dto.title,
        description: dto.description,
        userStory: dto.userStory ?? null,
        acceptanceCriteria: dto.acceptanceCriteria ?? [],
        priority: dto.priority ?? 'MUST_HAVE',
        source: dto.source ?? null,
        businessValue: dto.businessValue ?? null,
        createdById,
      },
      include: this.includeCreatedBy,
    });
  }

  async update(projectId: number, id: number, dto: UpdateRequirementReqDto, updatedById: number) {
    await this.findOne(projectId, id);
    return this.prisma.requirement.update({
      where: { id },
      data: {
        ...(dto.subtype !== undefined && { subtype: dto.subtype }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.userStory !== undefined && { userStory: dto.userStory }),
        ...(dto.acceptanceCriteria !== undefined && { acceptanceCriteria: dto.acceptanceCriteria }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.source !== undefined && { source: dto.source }),
        ...(dto.businessValue !== undefined && { businessValue: dto.businessValue }),
        updatedById,
      },
      include: this.includeCreatedBy,
    });
  }

  async changeStatus(
    projectId: number,
    id: number,
    dto: ChangeRequirementStatusReqDto,
    userId: number,
  ) {
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    const isOwnerOrEditor =
      membership?.role === ProjectMemberRole.OWNER ||
      membership?.role === ProjectMemberRole.EDITOR;

    if (!isOwnerOrEditor) {
      throw new ForbiddenException('Solo OWNER o EDITOR del proyecto pueden cambiar el estado');
    }

    await this.findOne(projectId, id);

    return this.prisma.requirement.update({
      where: { id },
      data: { status: dto.status, updatedById: userId },
      include: this.includeCreatedBy,
    });
  }

  async remove(projectId: number, id: number) {
    await this.findOne(projectId, id);
    await this.prisma.requirement.update({
      where: { id },
      data: { activo: false },
    });
  }
}
