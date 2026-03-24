import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent, CalendarView, CalendarModule } from 'angular-calendar';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';
import { TaskDialogComponent } from '../tasks/task-dialog';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent implements OnInit {
  @Input() projects: any[] = [];
  @Input() users: any[] = [];
  @Output() taskCreated = new EventEmitter<void>();

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() { 
    this.loadTasks(); 
  }

  // ADD THIS METHOD 👇
  goToToday() {
    this.viewDate = new Date();
    this.loadTasks(); // Reload the tasks for the current month!
  }

  loadTasks() {
    const start = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0).toISOString().split('T')[0];

    this.taskService.getCalendar(start, end).subscribe((tasks: any[]) => {
      this.events = tasks.map(t => ({
        title: t.title,
        start: new Date(t.start_date || t.created_at || t.due_date),
        end: new Date(t.due_date),
        color: this.getColor(t.status_id),
        meta: t
      }));
      this.cdr.detectChanges(); 
    });
  }

  getColor(status: number) {
    if (status === 1) return { primary: '#6b7280', secondary: '#1f2937' }; 
    if (status === 2) return { primary: '#f59e0b', secondary: '#78350f' }; 
    if (status === 3) return { primary: '#6366f1', secondary: '#312e81' }; 
    return { primary: '#9e9e9e', secondary: '#eeeeee' };
  }

  // Handle Event Click (Edit)
  handleEvent(event: any) {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '560px', panelClass: 'premium-dialog',
      data: { ...event.meta, users: this.users, projects: this.projects }
    });
    dialogRef.afterClosed().subscribe(res => { if (res) this.loadTasks(); });
  }

  // Handle Day Click (Create new task)
  dayClicked({ date }: { date: Date }): void {
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

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadTasks();
        this.taskCreated.emit(); // Tell Admin board to refresh
      }
    });
  }
}