import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  empresaId: number = 1;
  email: string = '';
  password: string = '';

  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    const data: LoginRequest = {
      empresaId: this.empresaId,
      email: this.email,
      password: this.password
    };

    this.authService.login(data).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.authService.guardarToken(res.token);
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error login', err);
        alert('Credenciales incorrectas');
      }
    });
  }
}