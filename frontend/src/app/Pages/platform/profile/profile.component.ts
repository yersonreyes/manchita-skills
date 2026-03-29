import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/authService/auth.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [Avatar, Tag, PageHeaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.sass',
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;
  readonly permissions = this.authService.userPermissions;
  readonly isSuperAdmin = this.authService.isSuperAdmin;
}
