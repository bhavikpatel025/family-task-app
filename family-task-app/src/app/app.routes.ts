import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/family-manager/family-manager.component').then(m => m.FamilyManagerComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/task-manager/task-manager.component').then(m => m.TaskManagerComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];