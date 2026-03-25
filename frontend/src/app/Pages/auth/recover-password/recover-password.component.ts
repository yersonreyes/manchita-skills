import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/authService/auth.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [FormsModule, InputText, Button, RouterLink],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.sass',
})
export class RecoverPasswordComponent {
  email = '';
  loading = signal(false);
  sent = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly uiDialog: UiDialogService,
  ) {}

  async onSend(): Promise<void> {
    if (!this.email) {
      this.uiDialog.showWarn('Campo requerido', 'Ingresa tu correo electrónico');
      return;
    }

    this.loading.set(true);
    try {
      await this.authService.forgotPassword({ email: this.email });
      this.sent.set(true);
    } catch {
      this.uiDialog.showError('Error', 'No se pudo procesar la solicitud');
    } finally {
      this.loading.set(false);
    }
  }
}
