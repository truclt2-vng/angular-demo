import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '@shared/components/ui/modal/modal.component';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { LabelComponent } from '@shared/components/form/label/label.component';

export interface FilterConfig {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { value: any; label: string }[];
}

@Component({
  selector: 'app-filter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent, LabelComponent],
  templateUrl: './filter-modal.component.html'
})
export class FilterModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Filter';
  @Input() filters: FilterConfig[] = [];
  @Input() filterValues: any = {};
  
  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onApply() {
    this.apply.emit(this.filterValues);
  }

  onReset() {
    this.reset.emit();
  }
}
