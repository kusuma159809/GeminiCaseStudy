import { Component, OnInit } from '@angular/core';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-loan-list',
  template: `
    <h2>Loan Applications</h2>
    <div class="filters">
      <select (change)="onFilterChange('status', $event)" class="form-control">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <input type="text" (input)="onFilterChange('search', $event)" placeholder="Search..." class="form-control">
    </div>
    
    <div class="mobile-cards" *ngIf="isMobile">
      <div class="loan-card" *ngFor="let loan of loans">
        <div class="loan-header">
          <strong>{{ loan.applicant_name }}</strong>
          <span class="loan-id">#{{ loan.id }}</span>
        </div>
        <div class="loan-details">
          <div><strong>Amount:</strong> {{ loan.loan_amount | currency }}</div>
          <div><strong>Type:</strong> {{ loan.loan_type }}</div>
          <div><strong>Status:</strong> {{ loan.status }}</div>
          <div>
            <strong>Stage:</strong> {{ getStageDisplay(loan.stage) }}
            <span class="tooltip help-icon">?
              <span class="tooltiptext">{{ getStageTooltip(loan.stage) }}</span>
            </span>
          </div>
        </div>
        <div class="loan-actions">
          <div class="status-buttons" *ngIf="permissions.canUpdate">
            <button *ngFor="let status of permissions.allowedStatuses" 
                    (click)="updateStatus(loan.id, status)"
                    [class]="'btn btn-sm status-btn-' + status"
                    [disabled]="loan.status === status">
              {{ status | titlecase }}
            </button>
          </div>
          <button (click)="deleteLoan(loan.id)" class="btn btn-danger btn-sm">Delete</button>
        </div>
      </div>
    </div>
    
    <table class="table" *ngIf="!isMobile">
      <thead>
        <tr>
          <th>ID</th>
          <th>Applicant</th>
          <th>Amount</th>
          <th>Type</th>
          <th>Status</th>
          <th>Stage
            <span class="tooltip help-icon">?
              <span class="tooltiptext">Hover over stage names for details</span>
            </span>
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let loan of loans">
          <td>{{ loan.id }}</td>
          <td>{{ loan.applicant_name }}</td>
          <td>{{ loan.loan_amount | currency }}</td>
          <td>{{ loan.loan_type }}</td>
          <td><span [class]="'status-badge ' + getStatusClass(loan.status)">{{ loan.status | titlecase }}</span></td>
          <td>
            <span class="tooltip">{{ getStageDisplay(loan.stage) }}
              <span class="tooltiptext">{{ getStageTooltip(loan.stage) }}</span>
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <div class="status-buttons" *ngIf="permissions.canUpdate">
                <button *ngFor="let status of permissions.allowedStatuses" 
                        (click)="updateStatus(loan.id, status)"
                        [class]="'btn btn-sm status-btn-' + status"
                        [disabled]="loan.status === status"
                        [title]="'Set status to ' + status">
                  {{ status | titlecase }}
                </button>
              </div>
              <button (click)="deleteLoan(loan.id)" class="btn btn-danger btn-sm">Delete</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .filters select,
    .filters input {
      max-width: 200px;
      flex: 1;
      min-width: 150px;
    }
    
    @media (max-width: 480px) {
      .filters {
        flex-direction: column;
        gap: 10px;
      }
      .filters select,
      .filters input {
        max-width: 100%;
      }
    }
    
    .mobile-cards {
      display: none;
    }
    
    @media (max-width: 768px) {
      .mobile-cards {
        display: block;
      }
      .table {
        display: none;
      }
    }
    
    .loan-card {
      background: white;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .loan-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .loan-id {
      color: #666;
      font-size: 14px;
    }
    
    .loan-details {
      margin-bottom: 15px;
    }
    
    .loan-details > div {
      margin-bottom: 5px;
      font-size: 14px;
    }
    
    .loan-actions {
      text-align: right;
    }
    
    .status-buttons {
      display: flex;
      gap: 5px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: flex-start;
    }
    
    .action-buttons .status-buttons {
      display: flex;
      gap: 3px;
      margin-bottom: 5px;
    }
    
    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }
    
    .status-btn-pending {
      background-color: #ffc107;
      color: #000;
      border: none;
    }
    
    .status-btn-approved {
      background-color: #28a745;
      color: white;
      border: none;
    }
    
    .status-btn-rejected {
      background-color: #dc3545;
      color: white;
      border: none;
    }
    
    .status-btn-pending:disabled,
    .status-btn-approved:disabled,
    .status-btn-rejected:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .status-approved {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status-rejected {
      background-color: #f8d7da;
      color: #721c24;
    }
  `]
})
export class LoanListComponent implements OnInit {
  loans: any[] = [];
  filters: any = {};
  isMobile = false;
  permissions: any = { canUpdate: false, allowedStatuses: [] };

  constructor(private loanService: LoanService) {
    this.checkMobile();
  }

  ngOnInit() {
    this.loadLoans();
    this.loadPermissions();
  }

  loadLoans() {
    this.loanService.getLoans(this.filters).subscribe({
      next: (loans) => this.loans = loans,
      error: (error) => console.error('Error loading loans:', error)
    });
  }

  onFilterChange(field: string, event: any) {
    this.filters[field] = event.target.value;
    this.loadLoans();
  }

  deleteLoan(id: number) {
    if (confirm('Are you sure?')) {
      this.loanService.deleteLoan(id).subscribe({
        next: () => this.loadLoans(),
        error: (error) => console.error('Error deleting loan:', error)
      });
    }
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
  }

  getStageDisplay(stage: string): string {
    const stageMap: any = {
      'application_submitted': 'Application Submitted',
      'document_verification': 'Document Verification',
      'credit_check': 'Credit Check',
      'approval_review': 'Approval Review',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    return stageMap[stage] || stage;
  }

  getStageTooltip(stage: string): string {
    const tooltips: any = {
      'application_submitted': 'Initial application has been received and is awaiting review',
      'document_verification': 'Required documents are being verified for completeness and authenticity',
      'credit_check': 'Credit history and score are being evaluated',
      'approval_review': 'Final review by loan approval committee',
      'approved': 'Loan has been approved and funds will be disbursed',
      'rejected': 'Loan application has been declined'
    };
    return tooltips[stage] || 'Current stage of the loan application process';
  }

  loadPermissions() {
    this.loanService.getPermissions().subscribe({
      next: (permissions) => this.permissions = permissions,
      error: (error) => console.error('Error loading permissions:', error)
    });
  }

  updateStatus(loanId: number, status: string) {
    this.loanService.updateLoanStatus(loanId, status).subscribe({
      next: () => {
        this.loadLoans();
        console.log(`Loan ${loanId} status updated to ${status}`);
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert(error.error?.error || 'Failed to update status');
      }
    });
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return classes[status] || '';
  }
}