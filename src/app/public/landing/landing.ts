import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carrusel } from './components/carrusel/carrusel';
import { TiposNegocio } from './components/tipos-negocio/tipos-negocio';
import { Funcionalidades } from './components/funcionalidades/funcionalidades';
import { Demo } from './components/demo/demo';
import { Precios } from './components/precios/precios';
import { Contacto } from './components/contacto/contacto';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, Carrusel, TiposNegocio, Funcionalidades, Demo, Precios, Contacto],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  anioActual = new Date().getFullYear();
}
