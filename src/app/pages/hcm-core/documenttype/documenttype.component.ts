import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { PivotRequest } from '@shared/models/rest-api.model';
import { PageConfig } from '@shared/models/page.config.model';
import { DeleteConfirmationModalComponent } from '@shared/components/common/delete-confirmation-modal/delete-confirmation-modal.component';
import { FilterConfig } from '@shared/components/common/filter-modal/filter-modal.component';
import { DataTableComponent, TableFieldConfig, TableAction } from '@shared/components/common/data-table/data-table.component';
import { ActionIcons } from '@shared/constants/action.constant';
import documenttypeConfig from './documenttype.config.json';
import { DocumentTypeService, DocumentType  } from './documenttype.service';

// Type alias for DocumentType-specific page configuration
type pageConfig = PageConfig<DocumentType>;

@Component({
  selector: 'app-documenttype',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, DataTableComponent, DeleteConfirmationModalComponent],
  templateUrl: './documenttype.component.html'
})
export class DocumentTypeComponent implements OnInit {
  private varService = inject(DocumentTypeService);
  private config: pageConfig = documenttypeConfig as pageConfig;

  // Configuration-driven properties
  pageTitle = this.config.pageTitle;
  searchPlaceholder = this.config.searchPlaceholder;
  addButtonLabel = this.config.addButtonLabel;
  allowDeleteAction = this.config.allowDelete;
  allowMultiSelect = this.config.allowMultiSelect;

  datas: DocumentType[] = [];
  totalCount = 0;
  isLoading = false;
  
  // Multi-select
  selectedItems: DocumentType[] = [];
  
  // Pagination
  currentPage = 0;
  pageSize = this.config.pageSize;
  totalPages = 0;

  // Filtering
  searchTerm = '';
  filterModel: any = {};
  
  // Sorting
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = this.config.defaultSortDirection;

  // Delete confirmation
  showDeleteConfirm = false;
  deleteItem: DocumentType | null = null;

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
    onClick: (documenttype: DocumentType) => this.handleAction(action.type, documenttype),
    visible: action.requiresAuth !== undefined ? () => !!action.requiresAuth : undefined,
    disabled: action.disableForApproved ? (documenttype: DocumentType) => documenttype.authStatus === 'A' : undefined,
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
  private handleAction(type: string, documenttype: DocumentType): void {
    const actionMap: Record<string, (documenttype: DocumentType) => void> = {
      'VIEW': (c) => this.openViewModal(c),
      'EDIT': (c) => this.openEditModal(c),
      'DELETE': (c) => this.confirmDelete(c)
    };
    actionMap[type]?.(documenttype);
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

  // Unified modal state
  modalState: any = {
    isOpen: false,
    mode: 'view',
    data: null
  };

  // Filter configuration from JSON
  filterConfigs: FilterConfig[] = this.config.advanceFilters;

  ngOnInit() {
    // Apply default filters (Active and Authorized)
    this.applyDefaultFilters();
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

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    
    // Preserve existing filters and add/update search
    if (this.searchTerm.trim()) {
      this.filterModel = {
        ...this.filterModel,
        [this.config.api.searchField]: {
          filterType: this.config.api.filterType,
          type: this.config.api.filterOperator,
          filter: this.searchTerm
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

  onSelectionChange(selectedItems: DocumentType[]) {
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
    this.searchTerm = '';
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

  openEditModal(documenttype: DocumentType) {
    const editData: Partial<DocumentType> = {};
    
    // Dynamically build edit data from config fields
    this.config.modal.editFields.forEach(field => {
      const keys = field.split('.');
      let source: any = documenttype;
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
        editData[lastKey as keyof DocumentType] = documenttype[lastKey as keyof DocumentType];
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

  openViewModal(documenttype: DocumentType) {
    this.modalState = {
      isOpen: true,
      mode: 'view',
      data: documenttype
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
    
    this.varService.create(data as Omit<DocumentType, 'id'>).subscribe({
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
    
    this.varService.update(data.id, data as DocumentType).subscribe({
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

  // Validate documenttype data using config
  private validateData(data: Partial<DocumentType> | null): boolean {
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
      const documenttype = this.modalState.data as DocumentType;
      this.closeModal();
      this.openEditModal(documenttype);
    }
  }

  confirmDelete(documenttype: DocumentType) {
    // Prevent deletion if authStatus is 'A' (redundant check, button should be disabled)
    if (documenttype.authStatus === 'A') {
      console.warn(this.config.messages.error.deleteApproved);
      return;
    }
    this.deleteItem = documenttype;
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
