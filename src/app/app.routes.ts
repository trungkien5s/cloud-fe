import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
            { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
            { path: 'change-password', loadComponent: () => import('./pages/change-password/change-password.component').then(m => m.ChangePasswordComponent) },
            { path: 'vm/create', loadComponent: () => import('./pages/vm-create/vm-create.component').then(m => m.VmCreateComponent) },
            { path: 'vm/detail/:id', loadComponent: () => import('./pages/vm-detail/vm-detail.component').then(m => m.VmDetailComponent) },
            { path: 'pricing', loadComponent: () => import('./pages/pricing/pricing.component').then(m => m.PricingComponent) },
            { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
            {
                path: 'vm/console/:id',
                loadComponent: () => import('./pages/vm-console/vm-console.component').then(m => m.VmConsoleComponent)
            },
        ]
    },
    { path: '**', redirectTo: '' }
];
