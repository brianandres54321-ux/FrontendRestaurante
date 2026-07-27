import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SlideCarrusel {
  icono: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel.html',
  styleUrl: './carrusel.scss'
})
export class Carrusel implements OnInit, OnDestroy {

  slides: SlideCarrusel[] = [
    {
      icono: 'bi-grid-3x3-gap-fill',
      titulo: 'Controla tu salón en tiempo real',
      descripcion: 'Ve el estado de cada mesa de un vistazo: libre, ocupada o esperando la cuenta.'
    },
    {
      icono: 'bi-fire',
      titulo: 'La cocina nunca se queda atrás',
      descripcion: 'Cada pedido llega al instante a la pantalla de cocina, sin comandas de papel.'
    },
    {
      icono: 'bi-credit-card-2-front-fill',
      titulo: 'Cobra como prefieras',
      descripcion: 'Efectivo o Mercado Pago, con cupones de descuento aplicados en segundos.'
    },
    {
      icono: 'bi-bar-chart-line-fill',
      titulo: 'Decide con datos, no con corazonadas',
      descripcion: 'Reportes de ventas exportables en PDF y Excel, listos cuando los necesites.'
    }
  ];

  slideActual = 0;
  private intervalo?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.iniciarAutoplay();
  }

  ngOnDestroy(): void {
    this.detenerAutoplay();
  }

  irA(index: number): void {
    this.slideActual = index;
    this.reiniciarAutoplay();
  }

  siguiente(): void {
    this.slideActual = (this.slideActual + 1) % this.slides.length;
  }

  anterior(): void {
    this.slideActual = (this.slideActual - 1 + this.slides.length) % this.slides.length;
    this.reiniciarAutoplay();
  }

  siguienteManual(): void {
    this.siguiente();
    this.reiniciarAutoplay();
  }

  private iniciarAutoplay(): void {
    this.intervalo = setInterval(() => this.siguiente(), 5000);
  }

  private detenerAutoplay(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = undefined;
    }
  }

  private reiniciarAutoplay(): void {
    this.detenerAutoplay();
    this.iniciarAutoplay();
  }
}
