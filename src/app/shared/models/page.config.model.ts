import { TableFieldConfig } from '@shared/components/common/data-table/data-table.component';
import { FilterConfig } from '@shared/components/common/filter-modal/filter-modal.component';

/**
 * Generic page configuration interface for entity management pages
 * Can be used for any CRUD page (Country, User, Product, etc.)
 */
export interface PageConfig<T = any> {
  // Page settings
  pageTitle: string;
  searchPlaceholder: string;
  addButtonLabel: string;
  allowDelete: boolean;
  allowMultiSelect: boolean;
  pageSize: number;
  defaultSortDirection: 'asc' | 'desc';
  
  // Default filters applied on page load
  defaultFilters: Record<string, string>;
  
  // Table configuration
  tableFields: TableFieldConfig[];
  
  // Action buttons configuration
  actions: Array<{
    type: string;
    label: string;
    colorClass: string;
    requiresAuth?: boolean;
    disableForApproved?: boolean;
    disabledMessage?: string;
  }>;
  
  // Filter modal configuration
  advanceFilters: FilterConfig[];
  
  // Modal configuration
  modal: {
    createDefaults: Partial<T>;
    editFields: string[];
  };
  
  // Delete confirmation modal
  deleteModal: {
    title: string;
    subtitle: string;
    warningMessage: string;
    fields: Array<{
      label: string;
      key: string;
      type?: 'text' | 'badge' | 'status';
    }>;
  };
  
  // Validation rules
  validation: {
    requiredFields: string[];
  };
  
  // Error and info messages
  messages: {
    error: {
      create: string;
      update: string;
      delete: string;
      load: string;
      loadCount: string;
      validation: string;
      missingId: string;
      deleteApproved: string;
    };
  };
  
  // API configuration
  api: {
    searchField: string;
    filterType: string;
    filterOperator: string;
  };
}
