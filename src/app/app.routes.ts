import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { VmCreateComponent } from './pages/vm-create/vm-create.component';
import { VmDetailComponent } from './pages/vm-detail/vm-detail.component';
import { PricingComponent } from './pages/pricing/pricing.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'change-password', component: ChangePasswordComponent },
            { path: 'vm/create', component: VmCreateComponent },
            { path: 'vm/detail/:id', component: VmDetailComponent },
            { path: 'pricing', component: PricingComponent },
        ]
    },
    { path: '**', redirectTo: '' }
];
