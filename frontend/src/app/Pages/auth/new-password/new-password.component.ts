import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/authService/auth.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { Button } from 'primeng/button';
import { Password } from 'primeng/password';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [FormsModule, Password, Button, RouterLink],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.sass',
})
export class NewPasswordComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  loading = signal(false);
  success = signal(false);
  private token = '';

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly uiDialog: UiDialogService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.uiDialog.showError('Token inválido', 'El enlace de recuperación no es válido');
      void this.router.navigate(['/auth/login']);
    }
  }

  async onSave(): Promise<void> {
    if (!this.newPassword || !this.confirmPassword) {
      this.uiDialog.showWarn('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.uiDialog.showWarn('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (this.newPassword.length < 6) {
      this.uiDialog.showWarn('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.loading.set(true);
    try {
      await this.authService.resetPassword({ token: this.token, newPassword: this.newPassword });
      this.success.set(true);
      setTimeout(() => void this.router.navigate(['/auth/login']), 3000);
    } catch {
      this.uiDialog.showError('Error', 'El token es inválido o ha expirado');
    } finally {
      this.loading.set(false);
    }
  }
}
