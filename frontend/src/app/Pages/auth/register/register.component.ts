import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/authService/auth.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, InputText, Password, Button, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.sass',
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly uiDialog: UiDialogService,
  ) {}

  async onRegister(): Promise<void> {
    if (!this.nombre || !this.email || !this.password) {
      this.uiDialog.showWarn('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.uiDialog.showWarn('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (this.password.length < 6) {
      this.uiDialog.showWarn('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.loading.set(true);
    try {
      await this.authService.register({
        email: this.email,
        nombre: this.nombre,
        password: this.password,
      });
      this.uiDialog.showSuccess('Cuenta creada', 'Tu cuenta fue creada exitosamente');
      await this.router.navigate(['/auth/login']);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar usuario';
      this.uiDialog.showError('Error', msg);
    } finally {
      this.loading.set(false);
    }
  }
}
