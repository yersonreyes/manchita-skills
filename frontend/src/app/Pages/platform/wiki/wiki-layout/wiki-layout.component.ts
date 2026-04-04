import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { WikiSidebarComponent } from '../wiki-sidebar/wiki-sidebar.component';

@Component({
  selector: 'app-wiki-layout',
  standalone: true,
  imports: [RouterOutlet, WikiSidebarComponent],
  template: `
    <div class="wiki-layout">
      <div class="wiki-layout__sidebar">
        <app-wiki-sidebar
          [projectId]="projectId()"
          [selectedPageId]="pageId()"
        />
      </div>
      <div class="wiki-layout__content">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .wiki-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      height: calc(100vh - 64px);
      overflow: hidden;
    }
    .wiki-layout__sidebar {
      overflow-y: auto;
      border-right: 1px solid var(--p-surface-200);
    }
    .wiki-layout__content {
      overflow-y: auto;
    }
  `],
})
export class WikiLayoutComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly params = toSignal(
    this.route.paramMap.pipe(map(p => p)),
  );

  projectId = computed(() => Number(this.params()?.get('id') ?? 0));
  pageId = computed(() => {
    const child = this.route.snapshot.firstChild;
    return child ? Number(child.paramMap.get('pageId')) || null : null;
  });
}
