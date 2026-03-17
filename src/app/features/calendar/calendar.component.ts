import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  CalendarEvent,
  CalendarView,
  CalendarModule
} from 'angular-calendar';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TaskService } from '../../services/task.service';

import { TaskDialogComponent } from '../../features/tasks/task-dialog';

@Component({
  selector: 'app-calendar',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    MatButtonModule,
    MatDialogModule,
    TaskDialogComponent
  ],

  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent implements OnInit {

  view: CalendarView = CalendarView.Week;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  events: CalendarEvent[] = [];

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {

    this.taskService.getTasks()
      .subscribe((tasks: any[]) => {

        this.events = tasks.map(t => ({

          title: t.title,

          start: new Date(t.start_date),

          end: new Date(t.due_date),

          color: this.getColor(t.status_id),

          draggable: true,

          resizable: {
            beforeStart: true,
            afterEnd: true
          },

          meta: t

        }));

      });

  }

  getColor(status: number) {

    if (status === 1)
      return { primary: '#6264a7', secondary: '#d6d7f5' };

    if (status === 2)
      return { primary: '#ff9800', secondary: '#ffe0b2' };

    if (status === 3)
      return { primary: '#4caf50', secondary: '#c8e6c9' };

    return { primary: '#9e9e9e', secondary: '#eeeeee' };

  }

  handleEvent(event: any) {

    const dialogRef = this.dialog.open(
      TaskDialogComponent,
      {
        data: event.meta,
        width: '400px'
      }
    );

    dialogRef.afterClosed().subscribe(() => {
      this.loadTasks();
    });

  }

}