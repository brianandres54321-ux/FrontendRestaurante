import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MesaDemo {
  nombre: string;
  estado: 'libre' | 'ocupada' | 'cuenta';
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demo.html',
  styleUrl: './demo.scss'
})
export class Demo {

  mesas: MesaDemo[] = [
    { nombre: 'Mesa 1', estado: 'ocupada' },
    { nombre: 'Mesa 2', estado: 'libre' },
    { nombre: 'Mesa 3', estado: 'cuenta' },
    { nombre: 'Mesa 4', estado: 'libre' },
    { nombre: 'Mesa 5', estado: 'ocupada' },
    { nombre: 'Mesa 6', estado: 'libre' },
  ];

  items = [
    { nombre: 'Hamburguesa clásica', cantidad: 2, precio: 28000 },
    { nombre: 'Limonada de coco', cantidad: 2, precio: 9000 },
    { nombre: 'Papas con queso', cantidad: 1, precio: 14000 },
  ];

  get total(): number {
    return this.items.reduce((acc, i) => acc + i.cantidad * i.precio, 0);
  }
}
