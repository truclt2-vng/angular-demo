import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '@shared/components/ui/modal/modal.component';
import { ButtonComponent } from '@shared/components/ui/button/button.component';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  templateUrl: './delete-confirmation-modal.component.html'
})
export class DeleteConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Delete Item';
  @Input() subtitle = 'This action cannot be undone';
  @Input() warningMessage = 'Are you sure you want to delete this item? All related data will be permanently removed.';
  @Input() itemData: any = null;
  @Input() fields: Array<{ label: string; key: string; type?: 'text' | 'badge' | 'status' }> = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  getFieldValue(item: any, key: string): any {
    const keys = key.split('.');
    let value = item;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || 'N/A';
  }
}
