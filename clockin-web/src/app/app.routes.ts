import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/users/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'users/:id',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/users/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'holidays',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/holidays/holidays-list.component').then(m => m.HolidaysListComponent)
      },
      {
        path: 'holidays/:id',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/holidays/holiday-form.component').then(m => m.HolidayFormComponent)
      },
      {
        path: 'entries',
        loadComponent: () => import('./features/entries/entries-list.component').then(m => m.EntriesListComponent)
      },
      {
        path: 'entries/:id',
        loadComponent: () => import('./features/entries/entry-form.component').then(m => m.EntryFormComponent)
      },
      {
        path: 'report',
        loadComponent: () => import('./features/report/report.component').then(m => m.ReportComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
