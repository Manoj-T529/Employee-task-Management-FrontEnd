// import { Component, Inject, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// import {
//   MAT_DIALOG_DATA,
//   MatDialogRef
// } from '@angular/material/dialog';

// import { MaterialModule } from '../shared/material.module';

// @Component({
//   selector: 'task-dialog',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     MaterialModule
//   ],
//   templateUrl: './task-dialog.html',
//   styleUrls: ['./task-dialog.css']
// })
// export class TaskDialog implements OnInit {

//   task: any;

//   comments: any[] = [];

//   activity: any[] = [];

//   newComment = '';

//   users: any[] = [];

//   constructor(
//     @Inject(MAT_DIALOG_DATA) public data: any,
//     private ref: MatDialogRef<TaskDialog>
//   ) {}

//   ngOnInit() {

//     this.task = { ...this.data };

//     this.comments = this.task.comments || [];

//     this.activity = this.task.activity || [];

//     this.users = this.data.users || [];

//   }


//   getUserName(id: any) {

//     const u = this.users.find(x => x.id == id);

//     return u ? u.name : '?';

//   }


//   getUserAvatar(id: any) {

//     const u = this.users.find(x => x.id == id);

//     if (!u) return '?';

//     return u.name[0];

//   }


//   addComment() {

//     if (!this.newComment) return;

//     const c = {
//       user: 'Admin',
//       text: this.newComment,
//       date: new Date()
//     };

//     this.comments.push(c);

//     this.activity.push({
//       text: 'Comment added',
//       date: new Date()
//     });

//     this.newComment = '';

//   }


//   save() {

//     this.task.comments = this.comments;

//     this.task.activity = this.activity;

//     this.activity.push({
//       text: 'Task updated',
//       date: new Date()
//     });

//     this.ref.close(this.task);

//   }


//   close() {
//     this.ref.close();
//   }

// }

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { TaskService } from '../services/task.service';
import { forkJoin, Observable } from 'rxjs';
import { MaterialModule } from '../shared/material.module';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MaterialModule],
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

    // FIX DOM WARNING: Convert backend ISO dates to YYYY-MM-DD
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
    if (this.isNew) {
      this.taskService.createTask(this.task).subscribe(() => this.dialogRef.close(true));
      return;
    }

    const apiCalls: Observable<any>[] = [];
    
    // Status Update
    if (this.task.status_id !== this.original.status_id) {
      apiCalls.push(this.taskService.updateStatus(this.task.id, this.task.status_id));
    }
    
    // Check if ANYTHING else changed (Dates, Story Points, Title, Priority, etc.)
    const detailsChanged = 
      this.task.start_date !== this.original.start_date || 
      this.task.due_date !== this.original.due_date ||
      this.task.story_points !== this.original.story_points ||
      this.task.priority_id !== this.original.priority_id ||
      this.task.description !== this.original.description ||
      this.task.title !== this.original.title;

    if (detailsChanged) {
      // Send the full updated object to the new backend endpoint
      apiCalls.push(this.taskService.updateTaskDetails(this.task.id, this.task));
    }

    if (apiCalls.length > 0) {
      forkJoin(apiCalls).subscribe(() => this.dialogRef.close(true));
    } else {
      this.dialogRef.close(false);
    }
  }

  close() { this.dialogRef.close(); }
}