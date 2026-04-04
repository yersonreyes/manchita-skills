import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { PlatformLayoutComponent } from './layout/layout.component';

export const PLATFORM_ROUTES: Routes = [
  {
    path: '',
    component: PlatformLayoutComponent,
    children: [
      {
        path: 'userManagement',
        loadComponent: () =>
          import('./user-management/user-management').then((m) => m.UserManagement),
        canActivate: [permissionGuard],
        data: { permissions: ['users:read'] },
      },
      {
        path: 'roleManagement',
        loadComponent: () =>
          import('./role-management/role-management').then((m) => m.RoleManagement),
        canActivate: [permissionGuard],
        data: { permissions: ['permissions:read'] },
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./project-management/project-management').then((m) => m.ProjectManagement),
        canActivate: [permissionGuard],
        data: { permissions: ['projects:read'] },
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./project-detail/project-detail').then((m) => m.ProjectDetailComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['project-phases:read'] },
      },
      {
        path: 'projects/:id/phases/:phaseId',
        loadComponent: () =>
          import('./phase-detail/phase-detail').then((m) => m.PhaseDetailComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['tool-applications:read'] },
      },
      {
        path: 'projects/:id/phases/:phaseId/applications/:appId',
        loadComponent: () =>
          import('./phase-detail/tool-application-detail/tool-application-detail').then(
            (m) => m.ToolApplicationDetailComponent,
          ),
        canActivate: [permissionGuard],
        data: { permissions: ['tool-applications:read'] },
      },
      {
        path: 'projects/:id/wiki',
        loadComponent: () =>
          import('./wiki/wiki-layout/wiki-layout.component').then((m) => m.WikiLayoutComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['wiki:read'] },
        children: [
          {
            path: ':pageId',
            loadComponent: () =>
              import('./wiki/wiki-page/wiki-page.component').then((m) => m.WikiPageComponent),
          },
          {
            path: '',
            loadComponent: () =>
              import('./wiki/wiki-page/wiki-page.component').then((m) => m.WikiPageComponent),
          },
        ],
      },
      {
        path: '',
        redirectTo: 'userManagement',
        pathMatch: 'full',
      },
    ],
  },
];
