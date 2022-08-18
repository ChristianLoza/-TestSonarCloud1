import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderBarComponent } from './header-bar/header-bar.component';
import { NavigationItemComponent } from './navigation/navigation-item.component';
import { NavigationComponent } from './navigation/navigation.component';
import { PhaseComponent } from './phase/phase.component';

@NgModule({
    imports: [CommonModule, RouterModule],
    declarations: [PhaseComponent, HeaderBarComponent, NavigationComponent, NavigationItemComponent],
    exports: [PhaseComponent, HeaderBarComponent, NavigationComponent, NavigationItemComponent]
})
export class HeadersModule {}