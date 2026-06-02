import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'encuesta', pathMatch: 'full' },
  {
    path: 'encuesta',
    loadComponent: () => import('./pages/survey/survey').then(m => m.Survey),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/layout/layout').then(m => m.Layout),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.Dashboard),
      },
    ],
  },
  { path: '**', redirectTo: 'encuesta' },
];
