import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface InOutNodeFieldUpdate {
  /** Model node id: 'process', 'input-{uuid}', 'output-{uuid}' */
  id: string;
  field: 'descripcion' | 'tipo' | 'proceso';
  value: string;
}

@Injectable()
export class InOutNodeEditService {
  readonly nodeUpdated = new Subject<InOutNodeFieldUpdate>();
  readonly nodeDeleted = new Subject<string>();
}
