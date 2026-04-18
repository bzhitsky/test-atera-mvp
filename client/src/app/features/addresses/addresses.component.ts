import {
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { OrderService, AddressDto, AddressPayload } from '../../core/services/order.service';

interface EditState {
  id: number;
  street: string;
  apartment: string;
  entrance: string;
  floor: string;
  intercom: string;
  label: string;
  comment: string;
}

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.scss',
})
export class AddressesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  addresses = signal<AddressDto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Add form
  showAddForm = signal(false);
  addStreet = '';
  addApartment = '';
  addEntrance = '';
  addFloor = '';
  addIntercom = '';
  addLabel = '';
  addComment = '';
  saving = signal(false);
  addError = signal<string | null>(null);

  // Edit form
  editState = signal<EditState | null>(null);
  editSaving = signal(false);
  editError = signal<string | null>(null);

  // Delete confirmation
  deleteConfirmId = signal<number | null>(null);
  deleting = signal(false);

  ngOnInit(): void {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.loading.set(true);
    this.orderService
      .getAddresses()
      .pipe(
        catchError(() => {
          this.error.set('Не удалось загрузить адреса');
          this.loading.set(false);
          return EMPTY;
        })
      )
      .subscribe((list) => {
        this.addresses.set(list);
        this.loading.set(false);
      });
  }

  // ── Add ─────────────────────────────────────────────────────────────────
  openAddForm(): void {
    this.addStreet = '';
    this.addApartment = '';
    this.addEntrance = '';
    this.addFloor = '';
    this.addIntercom = '';
    this.addLabel = '';
    this.addComment = '';
    this.addError.set(null);
    this.showAddForm.set(true);
    this.editState.set(null);
  }

  cancelAdd(): void {
    this.showAddForm.set(false);
    this.addError.set(null);
  }

  saveAdd(): void {
    if (!this.addStreet.trim() || this.saving()) return;
    this.saving.set(true);
    this.addError.set(null);

    const payload: AddressPayload = {
      street: this.addStreet.trim(),
      apartment: this.addApartment.trim() || undefined,
      entrance: this.addEntrance.trim() || undefined,
      floor: this.addFloor.trim() || undefined,
      intercom: this.addIntercom.trim() || undefined,
      label: this.addLabel.trim() || undefined,
      comment: this.addComment.trim() || undefined,
    };

    this.orderService
      .createAddress(payload)
      .pipe(
        catchError((err) => {
          this.addError.set(err?.error?.message ?? 'Не удалось добавить адрес');
          this.saving.set(false);
          return EMPTY;
        })
      )
      .subscribe((addr) => {
        this.addresses.update((list) => [...list, addr]);
        this.showAddForm.set(false);
        this.saving.set(false);
      });
  }

  // ── Edit ─────────────────────────────────────────────────────────────────
  startEdit(addr: AddressDto): void {
    this.showAddForm.set(false);
    this.editError.set(null);
    this.editState.set({
      id: addr.id,
      street: addr.street,
      apartment: addr.apartment ?? '',
      entrance: addr.entrance ?? '',
      floor: addr.floor ?? '',
      intercom: addr.intercom ?? '',
      label: addr.label ?? '',
      comment: addr.comment ?? '',
    });
  }

  cancelEdit(): void {
    this.editState.set(null);
    this.editError.set(null);
  }

  saveEdit(): void {
    const s = this.editState();
    if (!s || !s.street.trim() || this.editSaving()) return;
    this.editSaving.set(true);
    this.editError.set(null);

    const payload: AddressPayload = {
      street: s.street.trim(),
      apartment: s.apartment.trim() || undefined,
      entrance: s.entrance.trim() || undefined,
      floor: s.floor.trim() || undefined,
      intercom: s.intercom.trim() || undefined,
      label: s.label.trim() || undefined,
      comment: s.comment.trim() || undefined,
    };

    this.orderService
      .updateAddress(s.id, payload)
      .pipe(
        catchError((err) => {
          this.editError.set(err?.error?.message ?? 'Не удалось сохранить');
          this.editSaving.set(false);
          return EMPTY;
        })
      )
      .subscribe((updated) => {
        this.addresses.update((list) =>
          list.map((a) => (a.id === updated.id ? updated : a))
        );
        this.editState.set(null);
        this.editSaving.set(false);
      });
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  askDelete(id: number): void {
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  confirmDelete(): void {
    const id = this.deleteConfirmId();
    if (id === null || this.deleting()) return;
    this.deleting.set(true);

    this.orderService
      .deleteAddress(id)
      .pipe(
        catchError(() => {
          this.deleting.set(false);
          this.deleteConfirmId.set(null);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.addresses.update((list) => list.filter((a) => a.id !== id));
        this.deleteConfirmId.set(null);
        this.deleting.set(false);
      });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  addressDetails(addr: AddressDto): string {
    const parts: string[] = [];
    if (addr.apartment) parts.push(`кв. ${addr.apartment}`);
    if (addr.entrance) parts.push(`под. ${addr.entrance}`);
    if (addr.floor) parts.push(`эт. ${addr.floor}`);
    if (addr.intercom) parts.push(`домофон ${addr.intercom}`);
    return parts.join(' · ');
  }

  isEditing(id: number): boolean {
    return this.editState()?.id === id;
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
