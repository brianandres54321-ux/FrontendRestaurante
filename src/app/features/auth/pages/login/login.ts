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

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  login() {

    const data: LoginRequest = {
      empresaId: this.empresaId,
      email: this.email,
      password: this.password
    };

    this.authService.login(data).subscribe({
      next: (res: any) => {

        this.authService.guardarToken(res.token);

        this.router.navigate(['/productos']);
      },
      error: (err) => {
        console.error('Error login', err);
        alert('Credenciales incorrectas');
      }
    });

  }

}