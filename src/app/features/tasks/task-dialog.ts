import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TaskService } from '../../services/task.service';
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
export class TaskDialogComponent implements OnInit {
  task: any;
  original: any;
  users: any[] = [];
  projects: any[] = [];

    newComment: string = '';
    comments: any[] = [];
    currentUser: any;
  
  // THIS IS THE MISSING VARIABLE 👇
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
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!this.isNew) {
      this.loadComments();
    }
  }

   loadComments() {
    // Assuming you add this to task.service.ts: getComments(id)
    this.taskService.getComments(this.task.id).subscribe((res: any) => {
      this.comments = res || [];
    });
  }

  postComment() {
    if (!this.newComment.trim()) return;
    
    // Assuming you add this to task.service.ts: addComment(taskId, text)
    this.taskService.addComment(this.task.id, this.newComment).subscribe(() => {
      this.newComment = ''; // Clear input
      this.loadComments();  // Refresh comments list
    });
  }
  
  // Helper for displaying user details in comments
  // getUserName(userId: string) {
  //   const u = this.users.find(x => x.id === userId);
  //   return u ? (u.first_name || u.name || u.username) : 'Unknown User';
  // }
  
  getUserName(userId: string) {
    const u = this.users.find(x => x.id === userId);
    
    // If user is not found at all
    if (!u) return 'Unknown User';
    
    // If user is found, try to get their name. If all are null, use their email, or default to Unknown
    return u.first_name || u.name || u.username || u.email || 'Unknown User';
  }
  
  getAvatar(userId: string) {
    const name = this.getUserName(userId);
    
    // Safety check to prevent the .substring crash!
    if (!name || name === 'Unknown User') {
      return '??';
    }
    
    return name.substring(0, 2).toUpperCase();
  }

  // getAvatar(userId: string) {
  //   const name = this.getUserName(userId);
  //   return name !== 'Unknown User' ? name.substring(0, 2).toUpperCase() : '??';
  // }
  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch (e) { return null; }
  }

  save() {
    // CREATE MODE (From Calendar or Board)
    if (this.isNew) {
      this.taskService.createTask(this.task).subscribe(() => this.dialogRef.close(true));
      return;
    }

    // EDIT MODE
    const apiCalls: Observable<any>[] = [];
    if (this.task.status_id !== this.original.status_id) {
      apiCalls.push(this.taskService.updateStatus(this.task.id, this.task.status_id));
    }
    if (this.task.start_date !== this.original.start_date || this.task.due_date !== this.original.due_date) {
      apiCalls.push(this.taskService.updateTaskDate(this.task.id, this.task.start_date, this.task.due_date));
    }

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