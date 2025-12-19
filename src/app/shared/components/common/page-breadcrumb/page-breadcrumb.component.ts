import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-breadcrumb',
  imports: [
    RouterModule,
    CommonModule,
  ],
  templateUrl: './page-breadcrumb.component.html',
  styles: ``
})
export class PageBreadcrumbComponent {
  @Input() breadcrumbItems: { label: string; url?: string }[] = [];
  @Input() pageTitle = '';
}
