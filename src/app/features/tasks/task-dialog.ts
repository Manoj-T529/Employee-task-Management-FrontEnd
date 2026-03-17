import { Component, Inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-dialog',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],

  templateUrl: './task-dialog.html',
  styleUrls: ['./task-dialog.css']
})
export class TaskDialogComponent {

  task: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    private taskService: TaskService
  ) {

    this.task = { ...data };

  }

  save() {

    this.taskService.updateStatus(
      this.task.id,
      this.task.status_id
    ).subscribe(() => {

      this.dialogRef.close(true);

    });

  }

  close() {
    this.dialogRef.close();
  }

}