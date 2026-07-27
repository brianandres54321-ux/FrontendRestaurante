import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PLANES } from '../../../shared/models';

@Component({
  selector: 'app-precios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './precios.html',
  styleUrl: './precios.scss'
})
export class Precios {
  planes = PLANES;
}
