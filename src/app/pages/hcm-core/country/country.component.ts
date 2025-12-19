import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CountryService, Country } from '@app/shared/services/hcm-core/country.service';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { PivotRequest } from '@shared/models/rest-api.model';
import { PageConfig } from '@shared/models/page.config.model';
import { CountryModalComponent } from '@app/pages/hcm-core/country/modal/country-modal.component';
import { DeleteConfirmationModalComponent } from '@shared/components/common/delete-confirmation-modal/delete-confirmation-modal.component';
import { FilterConfig } from '@shared/components/common/filter-modal/filter-modal.component';
import { DataTableComponent, TableFieldConfig, TableAction } from '@shared/components/common/data-table/data-table.component';
import { ActionIcons } from '@shared/constants/action.constant';
import countryConfig from './country.config.json';

// Type alias for Country-specific page configuration
type pageConfig = PageConfig<Country>;

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, DataTableComponent, CountryModalComponent, DeleteConfirmationModalComponent],
  templateUrl: './country.component.html'
})
export class CountryComponent implements OnInit {
  private varService = inject(CountryService);
  private config: pageConfig = countryConfig as pageConfig;

  // Configuration-driven properties
  pageTitle = this.config.pageTitle;
  searchPlaceholder = this.config.searchPlaceholder;
  addButtonLabel = this.config.addButtonLabel;
  allowDeleteAction = this.config.allowDelete;
  allowMultiSelect = this.config.allowMultiSelect;

  datas: Country[] = [];
  totalCount = 0;
  isLoading = false;
  
  // Unified modal state
  modalState: any = {
    isOpen: false,
    mode: 'view',
    data: null
  };

  // Multi-select
  selectedItems: Country[] = [];
  
  // Pagination
  currentPage = 0;
  pageSize = this.config.pageSize;
  totalPages = 0;

  // Filtering
  ftsSearch = '';
  filterModel: any = {};
  activeQuickFilters: Record<string, string> = {};
  
  // Sorting
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = this.config.defaultSortDirection;

  // Delete confirmation
  showDeleteConfirm = false;
  deleteItem: Country | null = null;

  // Configuration-driven properties
  deleteModalTitle = this.config.deleteModal.title;
  deleteModalSubtitle = this.config.deleteModal.subtitle;
  deleteModalWarning = this.config.deleteModal.warningMessage;
  deleteModalFields = this.config.deleteModal.fields;

  // Table column configuration from JSON
  tableFieldConfigs: TableFieldConfig[] = this.config.tableFields;

  // Table actions configuration from JSON
  tableActions: TableAction[] = this.config.actions.map(action => ({
    icon: this.getActionIcon(action.type),
    label: action.label,
    colorClass: action.colorClass,
    onClick: (country: Country) => this.handleAction(action.type, country),
    visible: this.config.allowDelete !== undefined ? () => !!this.config.allowDelete : undefined,
    disabled: action.disableForApproved ? (country: Country) => country.authStatus === 'A' : undefined,
    disabledTitle: action.disabledMessage ? () => action.disabledMessage! : undefined
  }));

  // Get action icon based on type
  private getActionIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'VIEW': ActionIcons.VIEW,
      'EDIT': ActionIcons.EDIT,
      'DELETE': ActionIcons.DELETE
    };
    return iconMap[type] || '';
  }

  // Handle action based on type
  private handleAction(type: string, country: Country): void {
    const actionMap: Record<string, (country: Country) => void> = {
      'VIEW': (c) => this.openViewModal(c),
      'EDIT': (c) => this.openEditModal(c),
      'DELETE': (c) => this.confirmDelete(c)
    };
    actionMap[type]?.(country);
  }

  // Multi-select methods (now handled by data-table)
  toggleSelectAll(): void {
    if (this.selectedItems.length === this.datas.length) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.datas];
    }
  }

  clearSelection(): void {
    this.selectedItems = [];
  }



  // Filter configuration from JSON
  filterConfigs: FilterConfig[] = this.config.advanceFilters;

  ngOnInit() {
    // Apply default filters (Active and Authorized)
    this.applyDefaultFilters();
    // Set active quick filters based on defaults
    this.activeQuickFilters = { ...this.config.defaultFilters };
    this.loadPagging();
    this.loadCount();
  }

  // Apply default filters from config
  private applyDefaultFilters(): void {
    this.filterModel = this.buildFilterModel(this.config.defaultFilters);
  }

  loadPagging() {
    this.isLoading = true;

    const request: PivotRequest = {
      startRow: this.currentPage * this.pageSize,
      endRow: (this.currentPage + 1) * this.pageSize,
      filterModel: this.filterModel,
      sortModel: this.sortField ? [{
        colId: this.sortField,
        sort: this.sortDirection
      }] : []
    };

    this.varService.pivotPaging(request).subscribe({
      next: (response) => {
        this.datas = response.data?.data || [];
      },
      error: (error) => {
        console.error(this.config.messages.error.load, error);
        this.datas = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadCount() {
    this.varService.pivotCount(this.filterModel).subscribe({
      next: (count) => {
        this.totalCount = count;
        this.totalPages = Math.ceil(count / this.pageSize);
      },
      error: (error) => {
        console.error(this.config.messages.error.loadCount, error);
      }
    });
  }

  onSearch(ftsSearch: string) {
    this.ftsSearch = ftsSearch;
    
    // Preserve existing filters and add/update search
    if (this.ftsSearch.trim()) {
      this.filterModel = {
        ...this.filterModel,
        [this.config.api.searchField]: {
          filterType: this.config.api.filterType,
          type: this.config.api.filterOperator,
          filter: this.ftsSearch
        }
      };
    } else {
      // Remove search filter but keep other filters
      const { [this.config.api.searchField]: removed, ...remainingFilters } = this.filterModel;
      this.filterModel = remainingFilters;
    }
    
    this.currentPage = 0;
    this.loadPagging();
    this.loadCount();
  }

  onSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = this.config.defaultSortDirection;
    }
    this.loadPagging();
  }

  onSelectionChange(selectedItems: Country[]) {
    this.selectedItems = selectedItems;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.clearSelection();
    this.loadPagging();
  }

  onRefresh() {
    this.clearSelection();
    this.loadPagging();
    this.loadCount();
  }

  applyFilters(filters: any) {
    this.filterModel = this.buildFilterModel(filters);
    this.currentPage = 0;
    this.loadPagging();
    this.loadCount();
  }

  // Build filter model from key-value pairs using config
  private buildFilterModel(filters: Record<string, any>): any {
    const filterModel: any = {};
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filterModel[key] = {
          filterType: this.config.api.filterType,
          type: this.config.api.filterOperator,
          filter: filters[key]
        };
      }
    });
    
    return filterModel;
  }

  resetFilters() {
    this.applyDefaultFilters();
    this.ftsSearch = '';
    this.activeQuickFilters = {};
    this.currentPage = 0;
    this.loadPagging();
    this.loadCount();
  }

  toggleQuickFilter(field: string, value: string): void {
    if (this.activeQuickFilters[field] === value) {
      // Deactivate the filter
      delete this.activeQuickFilters[field];
      // Remove from filter model
      const { [field]: removed, ...remainingFilters } = this.filterModel;
      this.filterModel = remainingFilters;
    } else {
      // Activate the filter
      this.activeQuickFilters[field] = value;
      // Add to filter model
      this.filterModel = {
        ...this.filterModel,
        [field]: {
          filterType: this.config.api.filterType,
          type: this.config.api.filterOperator,
          filter: value
        }
      };
    }
    
    this.currentPage = 0;
    this.loadPagging();
    this.loadCount();
  }

  openCreateModal(): void {
    this.modalState = {
      isOpen: true,
      mode: 'create',
      data: this.config.modal.createDefaults
    };
  }

  openEditModal(country: Country) {
    const editData: Partial<Country> = {};
    
    // Dynamically build edit data from config fields
    this.config.modal.editFields.forEach(field => {
      const keys = field.split('.');
      let source: any = country;
      let target: any = editData;
      
      // Navigate nested properties
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!target[key]) target[key] = {};
        target = target[key];
        source = source?.[key];
      }
      
      // Set the final value
      const lastKey = keys[keys.length - 1];
      if (keys.length === 1) {
        editData[lastKey as keyof Country] = country[lastKey as keyof Country];
      } else {
        target[lastKey] = source?.[lastKey];
      }
    });
    
    this.modalState = {
      isOpen: true,
      mode: 'edit',
      data: editData
    };
  }

  openViewModal(country: Country) {
    this.modalState = {
      isOpen: true,
      mode: 'view',
      data: country
    };
  }

  closeModal(): void {
    this.modalState = {
      isOpen: false,
      mode: 'view',
      data: null
    };
  }

  handleModalSubmit(): void {
    if (!this.modalState.data) return;

    if (this.modalState.mode === 'create') {
      this.handleCreate();
    } else if (this.modalState.mode === 'edit') {
      this.handleUpdate();
    }
  }

  handleCreate(): void {
    const data = this.modalState.data;
    
    if (!this.validateData(data)) {
      console.error(this.config.messages.error.validation);
      return;
    }
    
    this.varService.create(data as Omit<Country, 'id'>).subscribe({
      next: () => {
        this.closeModal();
        this.onRefresh();
      },
      error: (error) => {
        console.error(this.config.messages.error.create, error);
        alert(this.config.messages.error.create);
      }
    });
  }

  handleUpdate(): void {
    const data = this.modalState.data;
    
    if (!data?.id) {
      console.error(this.config.messages.error.missingId);
      return;
    }
    
    if (!this.validateData(data)) {
      console.error(this.config.messages.error.validation);
      return;
    }
    
    this.varService.update(data.id, data as Country).subscribe({
      next: () => {
        this.closeModal();
        this.onRefresh();
      },
      error: (error) => {
        console.error(this.config.messages.error.update, error);
        alert(this.config.messages.error.update);
      }
    });
  }

  // Validate country data using config
  private validateData(data: Partial<Country> | null): boolean {
    if (!data) return false;
    
    return this.config.validation.requiredFields.every(field => {
      const keys = field.split('.');
      let value: any = data;
      
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined || value === null || value === '') return false;
      }
      
      return true;
    });
  }

  editFromView(): void {
    if (this.modalState.data && this.modalState.mode === 'view') {
      const country = this.modalState.data as Country;
      this.closeModal();
      this.openEditModal(country);
    }
  }

  confirmDelete(country: Country) {
    // Prevent deletion if authStatus is 'A' (redundant check, button should be disabled)
    if (country.authStatus === 'A') {
      console.warn(this.config.messages.error.deleteApproved);
      return;
    }
    this.deleteItem = country;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.deleteItem = null;
  }

  delete() {
    if (!this.deleteItem?.id) return;
    
    this.varService.bulkDelete([this.deleteItem.id]).subscribe({
      next: () => {
        this.cancelDelete();
        this.onRefresh();
      },
      error: (error) => {
        console.error(this.config.messages.error.delete, error);
        alert(this.config.messages.error.delete);
      }
    });
  }
}
