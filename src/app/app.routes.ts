import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Series } from './pages/series/series';
import { Categorias } from './pages/categorias/categorias';
import { Configuracoes } from './pages/configuracoes/configuracoes';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'series', component: Series },
  { path: 'categorias', component: Categorias },
  { path: 'configuracoes', component: Configuracoes },
  { path: '**', redirectTo: 'dashboard' }
];
