import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoanService } from '../services/loan.service';

@Component({
  selector: 'app-loan-form',
  template: `
    <h2>{{ isEdit ? 'Edit' : 'New' }} Loan Application</h2>
    <form [formGroup]="loanForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <input type="text" formControlName="applicant_name" placeholder="Applicant Name" class="form-control">
        <div *ngIf="loanForm.get('applicant_name')?.invalid && loanForm.get('applicant_name')?.touched" class="error">
          Name is required
        </div>
      </div>
      <div class="form-group">
        <input type="email" formControlName="applicant_email" placeholder="Email" class="form-control">
        <div *ngIf="loanForm.get('applicant_email')?.invalid && loanForm.get('applicant_email')?.touched" class="error">
          Valid email is required
        </div>
      </div>
      <div class="form-group">
        <input type="tel" formControlName="applicant_phone" placeholder="Phone" class="form-control">
        <div *ngIf="loanForm.get('applicant_phone')?.invalid && loanForm.get('applicant_phone')?.touched" class="error">
          Phone is required
        </div>
      </div>
      <div class="form-group">
        <input type="number" formControlName="loan_amount" placeholder="Loan Amount" class="form-control">
        <div *ngIf="loanForm.get('loan_amount')?.invalid && loanForm.get('loan_amount')?.touched" class="error">
          Valid amount is required
        </div>
      </div>
      <div class="form-group">
        <select formControlName="loan_type" class="form-control">
          <option value="">Select Loan Type</option>
          <option value="personal">Personal</option>
          <option value="home">Home</option>
          <option value="auto">Auto</option>
          <option value="business">Business</option>
        </select>
      </div>
      <div class="form-group">
        <textarea formControlName="purpose" placeholder="Purpose" class="form-control"></textarea>
      </div>
      <div class="form-group">
        <input type="number" formControlName="annual_income" placeholder="Annual Income" class="form-control">
      </div>
      <button type="submit" [disabled]="loanForm.invalid" class="btn btn-primary">
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
      <button type="button" (click)="cancel()" class="btn">Cancel</button>
    </form>
  `,
  styles: [`
    .error {
      color: red;
      font-size: 12px;
      margin-top: 5px;
    }
    .btn {
      margin-right: 10px;
      margin-bottom: 10px;
    }
    
    @media (max-width: 480px) {
      .form-group {
        margin-bottom: 20px;
      }
      
      .btn {
        width: 100%;
        margin-right: 0;
        margin-bottom: 10px;
      }
      
      h2 {
        font-size: 1.5em;
        margin-bottom: 20px;
      }
    }
  `]
})
export class LoanFormComponent implements OnInit {
  loanForm: FormGroup;
  isEdit = false;
  loanId?: number;

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loanForm = this.fb.group({
      applicant_name: ['', Validators.required],
      applicant_email: ['', [Validators.required, Validators.email]],
      applicant_phone: ['', Validators.required],
      loan_amount: ['', [Validators.required, Validators.min(1)]],
      loan_type: ['', Validators.required],
      purpose: [''],
      annual_income: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loanId = +id;
      this.loadLoan();
    }
  }

  loadLoan() {
    if (this.loanId) {
      this.loanService.getLoan(this.loanId).subscribe({
        next: (loan) => this.loanForm.patchValue(loan),
        error: (error) => console.error('Error loading loan:', error)
      });
    }
  }

  onSubmit() {
    if (this.loanForm.valid) {
      const loanData = this.loanForm.value;
      const operation = this.isEdit 
        ? this.loanService.updateLoan(this.loanId!, loanData)
        : this.loanService.createLoan(loanData);

      operation.subscribe({
        next: () => this.router.navigate(['/loans']),
        error: (error) => console.error('Error saving loan:', error)
      });
    }
  }

  cancel() {
    this.router.navigate(['/loans']);
  }
}