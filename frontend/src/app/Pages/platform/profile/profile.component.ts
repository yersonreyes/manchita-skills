import { Component } from '@angular/core';
import { AuthService } from '@core/services/authService/auth.service';
import { Avatar } from 'primeng/avatar';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [Card, Avatar, Tag],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.sass',
})
export class ProfileComponent {
  readonly user = this.authService.user;
  readonly permissions = this.authService.userPermissions;
  readonly isSuperAdmin = this.authService.isSuperAdmin;

  constructor(private readonly authService: AuthService) {}
}
