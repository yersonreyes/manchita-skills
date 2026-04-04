import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface WikiDropEvent {
  draggedId: number;
  targetId: number;
  position: 'before' | 'after' | 'inside';
}

@Injectable({ providedIn: 'root' })
export class WikiDragService {
  readonly draggingId = signal<number | null>(null);
  readonly dropped$ = new Subject<WikiDropEvent>();
}
