import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  async onSubmit() {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/admin/dashboard']);
    } catch (err: any) {
      const status = err?.status;
      if (status === 401) {
        this.error.set('Correo o contraseña incorrectos.');
      } else {
        this.error.set('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  goToSurvey() {
    this.router.navigate(['/encuesta']);
  }
}
