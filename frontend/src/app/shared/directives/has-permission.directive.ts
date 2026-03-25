import {
  DestroyRef,
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
} from '@angular/core';
import { PermissionCheckService } from '@core/services/common/permission-check.service';

@Directive({ selector: '[hasPermission]', standalone: true })
export class HasPermissionDirective {
  private readonly permissionService = inject(PermissionCheckService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  private permissions: string[] = [];
  private isRendered = false;

  @Input()
  set hasPermission(value: string | string[]) {
    this.permissions = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  constructor() {
    const effectRef = effect(() => {
      this.permissionService.permissions(); // Establece dependencia reactiva
      this.updateView();
    });
    this.destroyRef.onDestroy(() => effectRef.destroy());
  }

  private updateView(): void {
    const hasAccess = this.permissionService.hasAllPermissions(this.permissions);
    if (hasAccess && !this.isRendered) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isRendered = true;
    } else if (!hasAccess && this.isRendered) {
      this.viewContainer.clear();
      this.isRendered = false;
    }
  }
}
