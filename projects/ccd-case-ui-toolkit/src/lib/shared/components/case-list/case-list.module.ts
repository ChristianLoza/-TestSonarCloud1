import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserService } from '../../services';
import { PaginationModule } from '../pagination/pagination.module';
import { CaseListComponent } from './case-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgxPaginationModule,
    PaginationModule
  ],
  declarations: [CaseListComponent],
  exports: [CaseListComponent],
  providers: [
    BrowserService
  ]
})
export class CaseListModule { }
