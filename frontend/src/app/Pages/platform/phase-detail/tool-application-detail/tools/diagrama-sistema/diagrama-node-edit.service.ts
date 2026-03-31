import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NodeFieldUpdate {
  id: string;
  field: 'nombre' | 'tipo' | 'frontera';
  value: string;
}

@Injectable()
export class DiagramaNodeEditService {
  readonly nodeUpdated = new Subject<NodeFieldUpdate>();
  readonly nodeDeleted = new Subject<string>();
}
