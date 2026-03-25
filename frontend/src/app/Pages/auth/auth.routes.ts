import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/layout.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'recover-password',
        loadComponent: () =>
          import('./recover-password/recover-password.component').then(
            (m) => m.RecoverPasswordComponent,
          ),
      },
      {
        path: 'new-password',
        loadComponent: () =>
          import('./new-password/new-password.component').then(
            (m) => m.NewPasswordComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
