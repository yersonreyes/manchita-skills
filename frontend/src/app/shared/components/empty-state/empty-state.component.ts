import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  icon = input<string>('pi-inbox');
  title = input.required<string>();
  description = input<string>('');
  ctaLabel = input<string | null>(null);
  ctaIcon = input<string>('pi-plus');
  ctaSeverity = input<'primary' | 'secondary'>('primary');
  compact = input<boolean>(false);

  cta = output<void>();

  onCta(): void {
    this.cta.emit();
  }
}
