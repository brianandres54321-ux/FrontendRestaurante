import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest, TipoNegocio } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './login.scss'
})
export class Register {

  empresaNombre = '';
  tipoNegocio: TipoNegocio = 'RESTAURANTE';
  nitRut = '';
  adminNombre = '';
  username = '';
  email = '';
  confirmarEmail = '';
  password = '';
  confirmarPassword = '';

  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ── Requisitos de contraseña, evaluados en vivo para el checklist ──
  get tieneMinLength(): boolean { return this.password.length >= 8; }
  get tieneMayuscula(): boolean { return /[A-Z]/.test(this.password); }
  get tieneMinuscula(): boolean { return /[a-z]/.test(this.password); }
  get tieneNumero(): boolean { return /\d/.test(this.password); }
  get tieneEspecial(): boolean { return /[^A-Za-z0-9]/.test(this.password); }

  get passwordValida(): boolean {
    return this.tieneMinLength && this.tieneMayuscula && this.tieneMinuscula
      && this.tieneNumero && this.tieneEspecial;
  }

  get emailsCoinciden(): boolean {
    return !this.confirmarEmail || this.email === this.confirmarEmail;
  }

  get passwordsCoinciden(): boolean {
    return !this.confirmarPassword || this.password === this.confirmarPassword;
  }

  registrar(): void {
    if (this.isLoading) return;

    if (this.email !== this.confirmarEmail) {
      alert('Los correos no coinciden');
      return;
    }

    if (!this.passwordValida) {
      alert('La contraseña debe tener mínimo 8 caracteres, mayúsculas, minúsculas, números y un símbolo especial');
      return;
    }

    if (this.password !== this.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.isLoading = true;

    const data: RegisterRequest = {
      empresaNombre: this.empresaNombre,
      tipoNegocio: this.tipoNegocio,
      nitRut: this.nitRut,
      adminNombre: this.adminNombre,
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.register(data).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.authService.guardarToken(res.token);
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'No se pudo crear la cuenta');
      }
    });
  }
}
