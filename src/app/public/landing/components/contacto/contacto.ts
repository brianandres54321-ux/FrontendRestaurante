import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class Contacto {

  nombre = '';
  correo = '';
  mensaje = '';

  enviado = false;

  enviar(): void {
    // Nota: no hay backend detrás de este formulario todavía.
    // Por ahora solo confirma el envío en pantalla.
    this.enviado = true;
    this.nombre = '';
    this.correo = '';
    this.mensaje = '';
  }
}
