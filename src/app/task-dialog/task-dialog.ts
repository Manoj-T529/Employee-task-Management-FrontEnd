import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TaskService } from '../services/task.service';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatIconModule, 
    MatSelectModule
  ],
  templateUrl: './task-dialog.html',
  styleUrls: ['./task-dialog.css']
})
export class TaskDialogComponent {
  task: any;
  original: any;
  users: any[] = [];
  projects: any[] = [];
  isNew: boolean = false; 

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    private taskService: TaskService
  ) {
    this.users = data.users || [];
    this.projects = data.projects || [];
    this.isNew = data.isNew || false;
    
    this.original = { ...data };
    this.task = { ...data };

    // Format ISO dates from backend so HTML date inputs accept them
    this.task.start_date = this.formatDateForInput(this.task.start_date);
    this.task.due_date = this.formatDateForInput(this.task.due_date);
  }

  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch (e) { return null; }
  }

  save() {
    // CREATE MODE
    if (this.isNew) {
      this.taskService.createTask(this.task).subscribe(() => this.dialogRef.close(true));
      return;
    }

    // EDIT MODE
    const apiCalls: Observable<any>[] = [];

    // 1. Check Status
    if (this.task.status_id !== this.original.status_id) {
      apiCalls.push(this.taskService.updateStatus(this.task.id, this.task.status_id));
    }
    
    // 2. Check Dates
    if (this.task.start_date !== this.original.start_date || this.task.due_date !== this.original.due_date) {
      apiCalls.push(this.taskService.updateTaskDate(this.task.id, this.task.start_date, this.task.due_date));
    }

    // 3. Check Details (Title, Description, Priority, Story Points)
    const detailsChanged = 
      this.task.title !== this.original.title || 
      this.task.description !== this.original.description ||
      this.task.priority_id !== this.original.priority_id ||
      this.task.story_points !== this.original.story_points;

    if (detailsChanged) {
      // Send the changes to the backend
      apiCalls.push(this.taskService.updateTaskDetails(this.task.id, this.task));
    }

    // Run whatever changed!
    if (apiCalls.length > 0) {
      forkJoin(apiCalls).subscribe(() => this.dialogRef.close(true));
    } else {
      this.dialogRef.close(false); // No changes were made
    }
  }

  deleteTask() {
    if (confirm('Are you sure you want to permanently delete this issue?')) {
      this.taskService.deleteTask(this.task.id).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  close() { 
    this.dialogRef.close(); 
  }
}