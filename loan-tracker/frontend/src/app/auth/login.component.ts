import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <input type="email" formControlName="email" placeholder="Email" class="form-control">
          <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error">
            Valid email is required
          </div>
        </div>
        <div class="form-group">
          <input type="password" formControlName="password" placeholder="Password" class="form-control">
          <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error">
            Password is required
          </div>
        </div>
        <button type="submit" [disabled]="loginForm.invalid" class="btn btn-primary">Login</button>
        <div *ngIf="error" class="error">{{ error }}</div>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .error {
      color: red;
      font-size: 12px;
      margin-top: 5px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.authService.setToken(response.token);
          this.router.navigate(['/loans']);
        },
        error: (error) => {
          this.error = error.error?.error || 'Login failed';
        }
      });
    }
  }
}