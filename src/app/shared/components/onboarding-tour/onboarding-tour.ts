import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourService } from '../../../core/services/tour.service';

@Component({
  selector: 'app-onboarding-tour',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-tour.html',
  styleUrl: './onboarding-tour.scss'
})
export class OnboardingTourComponent {
  tourService = inject(TourService);

  sinObjetivo = signal(true);
  spotlightStyle = signal<Record<string, string>>({});
  cardStyle = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      this.tourService.activo();
      this.tourService.pasoActual();
      setTimeout(() => this.posicionar(), 30);
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.tourService.activo()) this.posicionar();
  }

  private posicionar(): void {
    if (!this.tourService.activo()) return;

    const paso = this.tourService.pasoActualData;
    const el = paso.target ? document.querySelector(paso.target) as HTMLElement | null : null;

    if (!el) {
      this.sinObjetivo.set(true);
      this.spotlightStyle.set({});
      this.cardStyle.set({});
      return;
    }

    this.sinObjetivo.set(false);
    const rect = el.getBoundingClientRect();
    const pad = 8;

    this.spotlightStyle.set({
      top: `${rect.top - pad}px`,
      left: `${rect.left - pad}px`,
      width: `${rect.width + pad * 2}px`,
      height: `${rect.height + pad * 2}px`
    });

    const cardWidth = 300;
    const margin = 12;

    let top = rect.bottom + margin;
    if (top + 170 > window.innerHeight) {
      top = Math.max(margin, rect.top - 170);
    }

    let left = rect.left;
    left = Math.min(Math.max(left, margin), window.innerWidth - cardWidth - margin);

    this.cardStyle.set({
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`
    });
  }
}
