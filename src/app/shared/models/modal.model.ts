export type ModalMode = 'create' | 'edit' | 'view';

export interface ModalState<T = any> {
  isOpen: boolean;
  mode: ModalMode;
  data: Partial<T> | null;
}
