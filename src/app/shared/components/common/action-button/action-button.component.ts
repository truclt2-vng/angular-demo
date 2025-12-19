import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionButtonComponent implements OnChanges {
  @Input() icon = '';
  @Input() label = '';
  @Input() colorClass = 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300';
  @Input() disabled = false;
  @Input() disabledClass = 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50';
  @Input() title = '';
  
  @Output() actionClick = new EventEmitter<void>();
  
  private cachedSafeIcon?: SafeHtml;
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['icon']) {
      this.cachedSafeIcon = this.sanitizer.bypassSecurityTrustHtml(this.icon);
    }
  }
  
  onClick(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.disabled) {
      this.actionClick.emit();
    }
  }
  
  getSafeIcon(): SafeHtml {
    if (!this.cachedSafeIcon) {
      this.cachedSafeIcon = this.sanitizer.bypassSecurityTrustHtml(this.icon);
    }
    return this.cachedSafeIcon;
  }
  
  getButtonClass(): string {
    return this.disabled ? this.disabledClass : this.colorClass;
  }
  
  getTitle(): string {
    return this.title || this.label;
  }
}
