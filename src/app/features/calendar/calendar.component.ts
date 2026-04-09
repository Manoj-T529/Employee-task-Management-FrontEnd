import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent, CalendarView, CalendarModule } from 'angular-calendar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { TaskService } from '../../services/task.service';
import { TaskDialogComponent } from '../tasks/task-dialog';
import { Project, User, Task } from '../../models/types'; 
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CalendarModule, MaterialModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); 

  @Input() projects: Project[] = [];
  @Input() users: User[] = [];
  @Input() canCreate: boolean = true;
  @Output() taskCreated = new EventEmitter<void>();

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  
  events: CalendarEvent<Task>[] = []; 

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() { 
    this.loadTasks(); 
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToToday() {
    this.viewDate = new Date(); 
    this.loadTasks();           
  }

  loadTasks() {
    const start = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0).toISOString().split('T')[0];

    this.taskService.getCalendar(start, end)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks: any[]) => {
          this.events = [...tasks.map(t => {
            const parsedStart = t.start_date ? new Date(t.start_date) : (t.due_date ? new Date(t.due_date) : new Date(t.created_at));
            const parsedEnd = t.due_date ? new Date(t.due_date) : parsedStart;

            return {
              title: t.title,
              start: parsedStart,
              end: parsedEnd,
              color: this.getColor(t.status_id),
              meta: t
            };
          })];
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Failed to load calendar events', err)
      });
  }

  getColor(status: number) {
    if (status === 1) return { primary: '#6b7280', secondary: '#1f2937' }; 
    if (status === 2) return { primary: '#f59e0b', secondary: '#78350f' }; 
    if (status === 3) return { primary: '#6366f1', secondary: '#312e81' }; 
    return { primary: '#9e9e9e', secondary: '#eeeeee' };
  }

  getEvents(day: any): CalendarEvent<Task>[] {
    return day.events || [];
  }

  handleEvent(event: CalendarEvent<Task>) {
    if (!this.canCreate) {
      console.warn("Employees are not allowed to edit tasks.");
      return; 
    }

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '560px', panelClass: 'premium-dialog',
      data: { ...event.meta, users: this.users, projects: this.projects }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => { if (res) this.loadTasks(); });
  }

  dayClicked({ date }: { date: Date }): void {
    if (!this.canCreate) {
      return; 
    }

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '560px', panelClass: 'premium-dialog',
      data: {
        isNew: true,
        start_date: date.toISOString(),
        due_date: date.toISOString(),
        users: this.users,
        projects: this.projects,
        status_id: 1,
        priority_id: 2
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res) {
        this.loadTasks();
        this.taskCreated.emit(); 
      }
    });
  }
}