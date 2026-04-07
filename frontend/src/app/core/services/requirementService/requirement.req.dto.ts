export type RequirementType = 'FUNCTIONAL' | 'NON_FUNCTIONAL';

export type RequirementSubtype =
  | 'PERFORMANCE'
  | 'SECURITY'
  | 'USABILITY'
  | 'SCALABILITY'
  | 'RELIABILITY'
  | 'AVAILABILITY'
  | 'MAINTAINABILITY'
  | 'COMPATIBILITY';

export type RequirementPriority = 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';

export type RequirementStatus = 'DRAFT' | 'IN_REVIEW' | 'VALIDATED' | 'REJECTED' | 'DEFERRED';

export interface CreateRequirementReqDto {
  type: RequirementType;
  subtype?: RequirementSubtype;
  title: string;
  description: string;
  userStory?: string;
  acceptanceCriteria?: string[];
  priority?: RequirementPriority;
  source?: string;
  businessValue?: string;
}

export interface UpdateRequirementReqDto {
  subtype?: RequirementSubtype;
  title?: string;
  description?: string;
  userStory?: string;
  acceptanceCriteria?: string[];
  priority?: RequirementPriority;
  source?: string;
  businessValue?: string;
}

export interface ChangeRequirementStatusReqDto {
  status: RequirementStatus;
}
