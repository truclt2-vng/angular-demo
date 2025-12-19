import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '@shared/components/ui/modal/modal.component';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { LabelComponent } from '@shared/components/form/label/label.component';

@Component({
  selector: 'app-country-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent, LabelComponent],
  templateUrl: './country-modal.component.html'
})
export class CountryModalComponent {
  @Input() modalState: any = {
    isOpen: false,
    mode: 'view',
    data: null
  };
  
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  @Output() editFromView = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    this.submit.emit();
  }

  onEditFromView() {
    this.editFromView.emit();
  }
}
