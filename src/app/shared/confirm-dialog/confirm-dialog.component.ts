import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div style="background: #121827; color: white; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); font-family: 'Inter', sans-serif;">
      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #f8fafc;">{{data.title}}</h2>
      <p style="color: #9ca3af; margin-bottom: 24px; font-size: 14px; line-height: 1.5;">{{data.message}}</p>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button mat-button (click)="dialogRef.close(false)" style="color: #d1d5db;">Cancel</button>
        <button mat-flat-button color="warn" (click)="dialogRef.close(true)" style="background: #ef4444; color: white;">
          {{data.confirmText || 'Delete'}}
        </button>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}