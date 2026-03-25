import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/authService/auth.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, InputText, Password, Button, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass',
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly uiDialog: UiDialogService,
  ) {}

  async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
      this.uiDialog.showWarn('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    try {
      await this.authService.login({ email: this.email, password: this.password });
      await this.router.navigate(['/platform']);
    } catch {
      // El error ya fue manejado por el HttpPromiseBuilder (toast)
    } finally {
      this.loading.set(false);
    }
  }
}
