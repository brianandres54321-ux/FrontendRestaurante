import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../shared/components/navbar';
import { ToastComponent } from '../shared/services/toast.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, ToastComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  empresaNombre = '';
  constructor(private authService: AuthService) { }
  ngOnInit(): void {
    this.empresaNombre = this.authService.getEmpresaNombre();
  }
}