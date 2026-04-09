import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Subject, forkJoin, takeUntil } from 'rxjs';

import { TaskService } from '../../services/task.service';
import { ToastService } from '../../shared/ui/toast.service';
import { User, Project } from '../../models/types';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule, MatSelectModule],
  templateUrl: './task-dialog.html',
  styleUrls: ['./task-dialog.css']
})
export class TaskDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  taskForm!: FormGroup;
  users: User[] = [];
  projects: Project[] = [];
  
  isNew: boolean = false; 
  isSaving: boolean = false;
  originalTaskId?: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    private fb: FormBuilder,
    private taskService: TaskService,
    private toast: ToastService
  ) {
    this.users = data.users || [];
    this.projects = data.projects || [];
    this.isNew = data.isNew || false;
    this.originalTaskId = data.id;

    console.log("=== 1. RAW DATA RECEIVED BY DIALOG ===");
    console.log("Raw Start Date:", data.start_date);
    console.log("Raw Due Date:", data.due_date);

    this.initForm(data);
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(data: any) {
    const formattedStart = this.formatDateForInput(data.start_date);
    const formattedDue = this.formatDateForInput(data.due_date);
    
    console.log("=== 2. FORMATTED FOR HTML INPUT (Should be YYYY-MM-DD or null) ===");
    console.log("Input Start Date:", formattedStart);
    console.log("Input Due Date:", formattedDue);

    const initialAssignees = Array.isArray(data.task_assignees) 
      ? data.task_assignees.map((a: any) => a.user_id || a) 
      : [];

    this.taskForm = this.fb.group({
      project_id: [{ value: data.project_id || '', disabled: !this.isNew }, this.isNew ? Validators.required : null],
      title: [data.title || '', [Validators.required, Validators.minLength(3)]],
      description: [data.description || ''],
      status_id: [data.status_id || 1, Validators.required],
      priority_id: [data.priority_id || 1, Validators.required],
      story_points: [data.story_points || null, Validators.min(0)],
      start_date: [formattedStart],
      due_date: [formattedDue],
      assignees: [initialAssignees]
    });
  }

  private formatDateForInput(dateStr: string | undefined | null): string | null {
    if (!dateStr || dateStr.trim() === '') return null; // Catch empty strings
    
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        console.warn(`⚠️ Invalid Date Detected during input format: ${dateStr}`);
        return null; 
      }

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`; 
    } catch (err) {
      console.error("Error formatting for input:", err);
      return null;
    }
  }

  private formatDateForApi(dateStr: string | undefined | null): string | null {
    if (!dateStr || dateStr.trim() === '') return null; // Catch empty inputs
    
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        console.warn(`⚠️ Invalid Date Detected during API format: ${dateStr}`);
        return null;
      }
      return d.toISOString(); 
    } catch (err) {
      console.error("Error formatting for API:", err);
      return null;
    }
  }

  save() {
    if (this.taskForm.invalid) {
      console.warn("⚠️ Form is invalid! Cannot save. Errors:", this.taskForm.errors);
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.taskForm.getRawValue(); 

    console.log("=== 3. RAW DATA FROM FORM (Before API Format) ===");
    console.log("Form Start Date:", formValue.start_date);
    console.log("Form Due Date:", formValue.due_date);

    // Convert back to Zod-friendly ISO Strings
    formValue.start_date = this.formatDateForApi(formValue.start_date);
    formValue.due_date = this.formatDateForApi(formValue.due_date);

    console.log("=== 4. FINAL PAYLOAD SENDING TO API (Should be ISO or null) ===");
    console.log("API Start Date:", formValue.start_date);
    console.log("API Due Date:", formValue.due_date);

    if (this.isNew) {
      this.taskService.createTask(formValue).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.toast.success('Task created successfully');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("❌ CREATE TASK API ERROR:", err);
          this.isSaving = false;
        }
      });
    } else {
      const apiCalls = [];

      apiCalls.push(this.taskService.updateStatus(this.originalTaskId!, formValue.status_id));
      apiCalls.push(this.taskService.updateTaskDetails(this.originalTaskId!, formValue));
      apiCalls.push(this.taskService.assignUsers(this.originalTaskId!, formValue.assignees));
      
      // Send null if they cleared the date, or the ISO string if they set one
      apiCalls.push(this.taskService.updateTaskDate(this.originalTaskId!, formValue.start_date, formValue.due_date));

      forkJoin(apiCalls).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.toast.success('Task updated successfully');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("❌ UPDATE TASK API ERROR:", err);
          this.isSaving = false;
        }
      });
    }
  }

  close() { 
    this.dialogRef.close(); 
  }
}