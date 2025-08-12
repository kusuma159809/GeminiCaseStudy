import { Component, OnInit } from '@angular/core';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <h2>Loan Dashboard</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Loans</h3>
        <div class="stat-value">{{ stats.totalLoans || 0 }}</div>
        <div class="stat-amount">{{ stats.totalAmount | currency }}</div>
      </div>
      
      <div class="stat-card approved">
        <h3>Approved</h3>
        <div class="stat-value">{{ stats.approvedCount || 0 }}</div>
        <div class="stat-amount">{{ stats.approvedAmount | currency }}</div>
      </div>
      
      <div class="stat-card pending">
        <h3>Pending</h3>
        <div class="stat-value">{{ stats.pendingCount || 0 }}</div>
        <div class="stat-amount">{{ stats.pendingAmount | currency }}</div>
      </div>
      
      <div class="stat-card rejected">
        <h3>Rejected</h3>
        <div class="stat-value">{{ stats.rejectedCount || 0 }}</div>
      </div>
    </div>
    
    <div class="chart-section">
      <h3>Loan Trends</h3>
      <div class="chart-container">
        <div class="chart-bar" *ngFor="let trend of stats.trends" 
             [style.height.px]="getBarHeight(trend.count)"
             [title]="trend.month + ': ' + trend.count + ' loans, ' + (trend.amount | currency)">
          <div class="bar-label">{{ getMonthLabel(trend.month) }}</div>
          <div class="bar-value">{{ trend.count }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }
    }
    
    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
    }
    
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    @media (max-width: 480px) {
      .stat-card {
        padding: 15px 10px;
      }
    }
    
    .stat-card.approved { border-left: 4px solid #28a745; }
    .stat-card.pending { border-left: 4px solid #ffc107; }
    .stat-card.rejected { border-left: 4px solid #dc3545; }
    
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #333;
    }
    
    @media (max-width: 480px) {
      .stat-value {
        font-size: 1.5em;
      }
    }
    
    .stat-amount {
      color: #666;
      margin-top: 5px;
      font-size: 14px;
    }
    
    @media (max-width: 480px) {
      .stat-amount {
        font-size: 12px;
      }
    }
    
    .chart-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    @media (max-width: 480px) {
      .chart-section {
        padding: 15px;
      }
    }
    
    .chart-container {
      display: flex;
      align-items: end;
      gap: 10px;
      height: 200px;
      padding: 20px 0;
      overflow-x: auto;
    }
    
    @media (max-width: 480px) {
      .chart-container {
        height: 150px;
        gap: 5px;
        padding: 15px 0;
      }
    }
    
    .chart-bar {
      background: #007bff;
      min-width: 40px;
      border-radius: 4px 4px 0 0;
      position: relative;
      cursor: pointer;
      transition: background 0.3s;
      flex-shrink: 0;
    }
    
    @media (max-width: 480px) {
      .chart-bar {
        min-width: 30px;
      }
    }
    
    .chart-bar:hover {
      background: #0056b3;
    }
    
    .bar-label {
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      white-space: nowrap;
    }
    
    @media (max-width: 480px) {
      .bar-label {
        font-size: 10px;
        bottom: -20px;
      }
    }
    
    .bar-value {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      font-weight: bold;
    }
    
    @media (max-width: 480px) {
      .bar-value {
        font-size: 10px;
        top: -15px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = {};

  constructor(private loanService: LoanService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loanService.getDashboardStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  getBarHeight(count: number): number {
    const maxCount = Math.max(...(this.stats.trends?.map((t: any) => t.count) || [1]));
    return Math.max(20, (count / maxCount) * 150);
  }

  getMonthLabel(month: string): string {
    return new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
}