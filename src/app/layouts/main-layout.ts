import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../shared/components/navbar';
import { ToastComponent } from '../shared/services/toast.component';
import { OnboardingTourComponent } from '../shared/components/onboarding-tour/onboarding-tour';
import { AuthService } from '../core/services/auth.service';
import { TourService } from '../core/services/tour.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, ToastComponent, OnboardingTourComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  empresaNombre = '';
  constructor(
    private authService: AuthService,
    private tourService: TourService
  ) { }
  ngOnInit(): void {
    this.empresaNombre = this.authService.getEmpresaNombre();
    this.tourService.iniciarSiCorresponde();
  }
}