import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginationComponent } from '../pagination/pagination.component';
import { FilterModalComponent, FilterConfig } from '../filter-modal/filter-modal.component';
import { ActionButtonComponent } from '../action-button/action-button.component';

export interface TableFieldConfig {
  field: string;
  label: string;
  sortable: boolean;
  width?: string;
  badge?: boolean;
  dateFormat?: string; // Format pattern for date fields (e.g., 'dd/MM/yyyy HH:mm', 'MMM dd, yyyy')
}

export interface TableAction {
  icon: string;
  label: string;
  colorClass: string;
  onClick: (item: any) => void;
  visible?: (item: any) => boolean;
  disabled?: (item: any) => boolean;
  disabledTitle?: (item: any) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, FilterModalComponent, ActionButtonComponent],
  providers: [DatePipe],
  templateUrl: './data-table.component.html'
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() totalCount = 0;
  @Input() isLoading = false;
  @Input() fieldConfigs: TableFieldConfig[] = [];
  @Input() actions: TableAction[] = [];
  @Input() filterConfigs: FilterConfig[] = [];
  
  // Pagination
  @Input() currentPage = 0;
  @Input() pageSize = 20;
  @Input() totalPages = 0;
  
  // Sorting
  @Input() sortField: string | null = null;
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  
  // Multi-select
  @Input() allowMultiSelect = false;
  @Input() selectedItems: any[] = [];
  
  // Search
  @Input() searchPlaceholder = 'Search...';
  @Input() showSearch = true;
  @Input() showFilter = true;
  @Input() showRefresh = true;
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() refresh = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() sort = new EventEmitter<string>();
  @Output() filterApply = new EventEmitter<any>();
  @Output() filterReset = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() selectAll = new EventEmitter<void>();
  
  searchTerm = '';
  showFilterModal = false;
  filterValues: any = {};
  
  constructor(private sanitizer: DomSanitizer, private datePipe: DatePipe) {}
  
  ngOnInit() {
  }
  
  onSearch() {
    this.search.emit(this.searchTerm);
  }
  
  onRefresh() {
    this.refresh.emit();
  }
  
  onSort(field: string) {
    this.sort.emit(field);
  }
  
  onPageChange(page: number) {
    this.pageChange.emit(page);
  }
  
  // Multi-select methods
  isSelected(item: any): boolean {
    return this.selectedItems.some(i => i.id === item.id);
  }
  
  toggleSelection(item: any): void {
    const index = this.selectedItems.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
    this.selectionChange.emit(this.selectedItems);
  }
  
  isAllSelected(): boolean {
    return this.data.length > 0 && this.selectedItems.length === this.data.length;
  }
  
  toggleSelectAll(): void {
    this.selectAll.emit();
  }
  
  // Filter methods
  openFilterModal() {
    this.showFilterModal = true;
  }
  
  closeFilterModal() {
    this.showFilterModal = false;
  }
  
  applyFilters(filters: any) {
    this.filterValues = filters;
    this.filterApply.emit(filters);
    this.closeFilterModal();
  }
  
  resetFilters() {
    this.filterValues = {};
    this.filterReset.emit();
    this.closeFilterModal();
  }
  
  // Helper method to get nested field values
  getFieldValue(obj: any, field: string): any {
    return field.split('.').reduce((o, key) => o?.[key], obj);
  }
  
  // Format field value (handles dates and other formatting)
  getFormattedFieldValue(item: any, config: TableFieldConfig): any {
    const value = this.getFieldValue(item, config.field);
    
    // Format date if dateFormat is specified
    if (config.dateFormat && value) {
      try {
        return this.datePipe.transform(value, config.dateFormat) || value;
      } catch (error) {
        console.error('Error formatting date:', error);
        return value;
      }
    }
    
    return value;
  }
  
  // Get badge styling for specific fields
  getBadgeClass(config: TableFieldConfig, item: any): string {
    if (config.field === 'codeAlpha2') {
      return 'px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-300';
    }
    if (config.field === 'recordStatus') {
      const status = this.getFieldValue(item, config.field);
      return status === 'O'
        ? 'px-2.5 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'px-2.5 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }

    if (config.field === 'authStatus') {
      const status = this.getFieldValue(item, config.field);
      return status === 'A'
        ? 'px-2.5 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'px-2.5 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    return '';
  }
  
  // Get badge display value
  getBadgeValue(config: TableFieldConfig, item: any): string {
    if (config.field === 'recordStatus') {
      const status = this.getFieldValue(item, config.field);
      return status === 'O' ? 'Active' : 'Inactive';
    }else if (config.field === 'authStatus') {
      const status = this.getFieldValue(item, config.field);
      return status === 'A' ? 'Authorized' : 'Unauthorized';
    }
    return this.getFieldValue(item, config.field);
  }
  
  // Check if action should be visible
  isActionVisible(action: TableAction, item: any): boolean {
    return action.visible ? action.visible(item) : true;
  }

  
  isActionDisabled(action: TableAction, item: any): boolean {
    return action.disabled ? action.disabled(item) : false;
  }
  
  // Get action title (for disabled state)
  getActionTitle(action: TableAction, item: any): string {
    if (this.isActionDisabled(action, item) && action.disabledTitle) {
      return action.disabledTitle(item);
    }
    return action.label;
  }
  
  // TrackBy function for actions to prevent unnecessary re-renders
  trackByActionLabel(index: number, action: TableAction): string {
    return action.label;
  }
}
