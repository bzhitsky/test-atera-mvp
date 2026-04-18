import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="addresses-page"><h1>Мои адреса</h1></div>`,
})
export class AddressesComponent {}
