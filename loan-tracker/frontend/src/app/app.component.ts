import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <nav *ngIf="authService.isLoggedIn()">
      <a routerLink="/dashboard">Dashboard</a>
      <a routerLink="/loans">Loans</a>
      <a routerLink="/loans/new">New Loan</a>
      <button (click)="logout()">Logout</button>
    </nav>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    nav {
      background: #333;
      padding: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    nav a, nav button {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      background: none;
      border: none;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
    }
    nav a:hover, nav button:hover {
      background: #555;
    }
    @media (max-width: 480px) {
      nav {
        padding: 0.5rem;
      }
      nav a, nav button {
        padding: 0.4rem 0.8rem;
        font-size: 12px;
      }
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}