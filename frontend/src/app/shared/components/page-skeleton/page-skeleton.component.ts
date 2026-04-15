import { Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type PageSkeletonVariant = 'table' | 'cards' | 'detail';

@Component({
  selector: 'app-page-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './page-skeleton.component.html',
})
export class PageSkeletonComponent {
  variant = input<PageSkeletonVariant>('table');
  rows = input<number>(6);

  rowList = computed(() => Array.from({ length: this.rows() }));
}
