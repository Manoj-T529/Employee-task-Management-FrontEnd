import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent, CalendarView, CalendarModule } from 'angular-calendar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { TaskService } from '../../services/task.service';
import { TaskDialogComponent } from '../tasks/task-dialog';
import { Project, User, Task } from '../../models/types'; // Strict Typings
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CalendarModule, MaterialModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // Memory leak prevention

  @Input() projects: Project[] = [];
  @Input() users: User[] = [];
  @Input() canCreate: boolean = true;
  @Output() taskCreated = new EventEmitter<void>();

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  
  // FAANG Fix: Strongly typed CalendarEvents
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
// calendar.component.ts
  goToToday() {
    this.viewDate = new Date(); // Resets calendar to current month/day
    this.loadTasks();           // Fetches tasks for the new month
  }

  loadTasks() {

    console.log("Load Tasks called in calendar Component");

    const start = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0).toISOString().split('T')[0];

    this.taskService.getCalendar(start, end)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks: any[]) => {
          // Map to a new array to force Angular CD to re-render the calendar UI
          // calendar.component.ts inside loadTasks()

this.events = [...tasks.map(t => {
  // 1. Strictly parse dates, falling back to created_at if completely empty
  const parsedStart = t.start_date ? new Date(t.start_date) : (t.due_date ? new Date(t.due_date) : new Date(t.created_at));
  
  // 2. If no due_date exists, force it to be a 1-day event by making end = start
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

  // loadTasks() {
  //   const start = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1).toISOString().split('T')[0];
  //   const end = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0).toISOString().split('T')[0];

  //   this.taskService.getCalendar(start, end)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (tasks: Task[]) => {
  //         this.events = tasks.map(t => ({
  //           title: t.title,
  //           // Safe fallback if start_date is missing
  //           start: new Date(t.start_date || t.due_date || new Date()), 
  //           end: t.due_date ? new Date(t.due_date) : undefined,
  //           color: this.getColor(t.status_id),
  //           meta: t // Attaches the full strictly-typed Task object
  //         }));
  //         this.cdr.detectChanges(); 
  //       },
  //       error: (err) => console.error('Failed to load calendar events', err)
  //     });
  // }

  getColor(status: number) {
    if (status === 1) return { primary: '#6b7280', secondary: '#1f2937' }; 
    if (status === 2) return { primary: '#f59e0b', secondary: '#78350f' }; 
    if (status === 3) return { primary: '#6366f1', secondary: '#312e81' }; 
    return { primary: '#9e9e9e', secondary: '#eeeeee' };
  }

   getEvents(day: any): CalendarEvent<Task>[] {
    return day.events || [];
  }

							  
  // Find the handleEvent method and add the guard at the top:

  handleEvent(event: CalendarEvent<Task>) {
    // 👇 FIX: Stop employees from opening the task update dialog
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
    // 👇 If they are an employee, STOP them from doing anything!
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
									   
//   dayClicked({ date }: { date: Date }): void {
//     const dialogRef = this.dialog.open(TaskDialogComponent, {
//       width: '560px', panelClass: 'premium-dialog',
//       data: {
//         isNew: true,
//         start_date: date.toISOString(),
//         due_date: date.toISOString(),
//         users: this.users,
//         projects: this.projects,
//         status_id: 1,
//         priority_id: 2
//       }
//     });

//     dialogRef.afterClosed()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(res => {
//         if (res) {
//           this.loadTasks();
//           this.taskCreated.emit(); 
//         }
//       });
//   }
// }



// import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { CalendarEvent, CalendarView, CalendarModule } from 'angular-calendar';
// import { MatDialog } from '@angular/material/dialog';
// import { TaskService } from '../../services/task.service';
// import { TaskDialogComponent } from '../tasks/task-dialog';

// @Component({
//   selector: 'app-calendar',
//   standalone: true,
//   imports: [CommonModule, CalendarModule],
//   templateUrl: './calendar.html',
//   styleUrls: ['./calendar.css']
// })
// export class CalendarComponent implements OnInit {
//   @Input() projects: any[] = [];
//   @Input() users: any[] = [];
//   @Output() taskCreated = new EventEmitter<void>();

//   view: CalendarView = CalendarView.Month;
//   CalendarView = CalendarView;
//   viewDate: Date = new Date();
//   events: CalendarEvent[] = [];

//   constructor(
//     private taskService: TaskService,
//     private dialog: MatDialog,
//     private cdr: ChangeDetectorRef 
//   ) {}

//   ngOnInit() { 
//     this.loadTasks(); 
//   }

//   // ADD THIS METHOD 👇
//   goToToday() {
//     this.viewDate = new Date();
//     this.loadTasks(); // Reload the tasks for the current month!
//   }

//   loadTasks() {
//     const start = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1).toISOString().split('T')[0];
//     const end = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0).toISOString().split('T')[0];

//     this.taskService.getCalendar(start, end).subscribe((tasks: any[]) => {
//       this.events = tasks.map(t => ({
//         title: t.title,
//         start: new Date(t.start_date || t.created_at || t.due_date),
//         end: new Date(t.due_date),
//         color: this.getColor(t.status_id),
//         meta: t
//       }));
//       this.cdr.detectChanges(); 
//     });
//   }

//   getColor(status: number) {
//     if (status === 1) return { primary: '#6b7280', secondary: '#1f2937' }; 
//     if (status === 2) return { primary: '#f59e0b', secondary: '#78350f' }; 
//     if (status === 3) return { primary: '#6366f1', secondary: '#312e81' }; 
//     return { primary: '#9e9e9e', secondary: '#eeeeee' };
//   }

//   // Handle Event Click (Edit)
//   handleEvent(event: any) {
//     const dialogRef = this.dialog.open(TaskDialogComponent, {
//       width: '560px', panelClass: 'premium-dialog',
//       data: { ...event.meta, users: this.users, projects: this.projects }
//     });
//     dialogRef.afterClosed().subscribe(res => { if (res) this.loadTasks(); });
//   }

//   // Handle Day Click (Create new task)
//   dayClicked({ date }: { date: Date }): void {
//     const dialogRef = this.dialog.open(TaskDialogComponent, {
//       width: '560px', panelClass: 'premium-dialog',
//       data: {
//         isNew: true,
//         start_date: date.toISOString(),
//         due_date: date.toISOString(),
//         users: this.users,
//         projects: this.projects,
//         status_id: 1,
//         priority_id: 2
//       }
//     });

//     dialogRef.afterClosed().subscribe(res => {
//       if (res) {
//         this.loadTasks();
//         this.taskCreated.emit(); // Tell Admin board to refresh
//       }
//     });
//   }
// }