import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carrusel } from './components/carrusel';
import { Funcionalidades } from './components/funcionalidades';
import { Demo } from './components/demo';
import { Precios } from './components/precios';
import { Contacto } from './components/contacto';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, Carrusel, Funcionalidades, Demo, Precios, Contacto],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  anioActual = new Date().getFullYear();
}
