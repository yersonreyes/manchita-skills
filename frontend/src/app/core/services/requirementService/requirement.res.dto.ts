import { RequirementPriority, RequirementStatus, RequirementSubtype, RequirementType } from './requirement.req.dto';

export interface RequirementCreatedByDto {
  id: number;
  nombre: string;
}

export interface RequirementResDto {
  id: number;
  projectId: number;
  type: RequirementType;
  subtype: RequirementSubtype | null;
  title: string;
  description: string;
  userStory: string | null;
  acceptanceCriteria: string[];
  priority: RequirementPriority;
  source: string | null;
  businessValue: string | null;
  status: RequirementStatus;
  activo: boolean;
  createdById: number;
  updatedById: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy: RequirementCreatedByDto;
}
