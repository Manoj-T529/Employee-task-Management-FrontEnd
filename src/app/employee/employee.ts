import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { NgFor, NgIf } from '@angular/common';
import { MaterialModule } from '../shared/material.module';

//type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

export type TaskStatus = 1 | 2 | 3;

const STATUS_MAP: Record<number, string> = {
  1: 'To Do',
  2: 'In Progress',
  3: 'Completed'
};

const STATUS_NAME_TO_ID: Record<string, number> = {
  'To Do': 1,
  'In Progress': 2,
  'Completed': 3
};

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [DragDropModule,NgFor, 

  MaterialModule],
  templateUrl: './employee.html',
  styleUrls: ['./employee.css']
})
// export class Employee implements OnInit {


//   allTasks: Task[] = [];

//   todoTasks: Task[] = [];
//   inProgressTasks: Task[] = [];
//   completedTasks: Task[] = [];

//   readonly STATUSES: TaskStatus[] = [
//     'To Do',
//     'In Progress',
//     'Completed'
//   ];




//   isDarkMode = true;

//   constructor(
//     private readonly taskService: TaskService,
//     private readonly router: Router,
//     private readonly cdr: ChangeDetectorRef
//   ) {}



//   ngOnInit(): void {
//     this.initializeTheme();
//     this.loadTasks();
//   }



//   private initializeTheme(): void {
//     this.isDarkMode = !document.body.classList.contains('light-theme');
//   }

//   toggleTheme(): void {
//     document.body.classList.toggle('light-theme');
//     this.isDarkMode = !this.isDarkMode;
//   }


//  private loadTasks(): void {
//   this.taskService.getTasks().subscribe({
//     next: (tasks: Task[]) => {
//        console.log('API Response:', tasks);
//       this.allTasks = tasks;
//       this.groupTasksByStatus();
//       this.cdr.detectChanges();
//     },
//     error: (err) => {
//       console.error('Failed to load tasks', err);
//     }
//   });
// }


//   private groupTasksByStatus(): void {
//     this.todoTasks = this.filterByStatus('To Do');
//     this.inProgressTasks = this.filterByStatus('In Progress');
//     this.completedTasks = this.filterByStatus('Completed');
//   }

//   private filterByStatus(status: TaskStatus): Task[] {
//     return this.allTasks.filter(task => task.status === status);
//   }

 

//   drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {

//     if (event.previousContainer === event.container) {

//       moveItemInArray(
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       );

//       return;
//     }

//     transferArrayItem(
//       event.previousContainer.data,
//       event.container.data,
//       event.previousIndex,
//       event.currentIndex
//     );

//     const movedTask = event.container.data[event.currentIndex];
//     movedTask.status = newStatus;

//     this.taskService.updateStatus(movedTask.id, newStatus).subscribe({
//       error: (err) => console.error(err)
//     });


//   }



//  changeStatus(taskId: number, status: TaskStatus): void {

//   const task = this.allTasks.find(t => t.id === taskId);
//   if (!task) return;

//   const previousStatus = task.status;
//   task.status = status;

//   this.groupTasksByStatus();

//   this.taskService.updateStatus(taskId, status).subscribe({
//     error: (err) => {
//       console.error(err);
//       task.status = previousStatus; // rollback on failure
//       this.groupTasksByStatus();
//     }
//   });
// }


 

//   logout(): void {
//     this.router.navigate(['/']);
//   }



//   get todoCount(): number {
//     return this.todoTasks.length;
//   }

//   get inProgressCount(): number {
//     return this.inProgressTasks.length;
//   }

//   get completedCount(): number {
//     return this.completedTasks.length;
//   }
// }





export class Employee implements OnInit {


  allTasks: Task[] = [];

  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  completedTasks: Task[] = [];


  readonly STATUSES = [
    'To Do',
    'In Progress',
    'Completed'
  ];


  isDarkMode = true;


  constructor(
    private readonly taskService: TaskService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}



  ngOnInit(): void {
    this.initializeTheme();
    this.loadTasks();
  }



  private initializeTheme(): void {
    this.isDarkMode =
      !document.body.classList.contains('light-theme');
  }


  toggleTheme(): void {
    document.body.classList.toggle('light-theme');
    this.isDarkMode = !this.isDarkMode;
  }



  /* ================= LOAD ================= */

  private loadTasks(): void {

    this.taskService.getTasks().subscribe({

      next: (tasks: Task[]) => {

        console.log('API', tasks);

        this.allTasks = tasks;

        this.groupTasksByStatus();

        this.cdr.detectChanges();
      },

      error: (err) => console.error(err)

    });

  }



  /* ================= GROUP ================= */

  private groupTasksByStatus(): void {

    this.todoTasks =
      this.allTasks.filter(t => t.status_id === 1);

    this.inProgressTasks =
      this.allTasks.filter(t => t.status_id === 2);

    this.completedTasks =
      this.allTasks.filter(t => t.status_id === 3);

  }



  /* ================= DROP ================= */

  drop(
    event: CdkDragDrop<Task[]>,
    newStatusName: string
  ): void {

    if (
      event.previousContainer === event.container
    ) {

      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      return;
    }


    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );


    const movedTask =
      event.container.data[event.currentIndex];

    const newStatusId =
      STATUS_NAME_TO_ID[newStatusName];


    movedTask.status_id = newStatusId;


    this.taskService
      .updateStatus(
        movedTask.id,
        newStatusId
      )
      .subscribe({
        error: err => console.error(err)
      });

  }



  /* ================= SELECT CHANGE ================= */

  changeStatus(
    taskId: string,
    statusName: string
  ): void {

    const task =
      this.allTasks.find(
        t => t.id === taskId
      );

    if (!task) return;


    const previous = task.status_id;

    const newId =
      STATUS_NAME_TO_ID[statusName];


    task.status_id = newId;

    this.groupTasksByStatus();


    this.taskService
      .updateStatus(taskId, newId)
      .subscribe({

        error: err => {

          console.error(err);

          task.status_id = previous;

          this.groupTasksByStatus();

        }

      });

  }



  /* ================= HELPERS ================= */

  getStatusName(task: Task): string {

    return STATUS_MAP[task.status_id];

  }



  /* ================= NAV ================= */

  logout(): void {
    this.router.navigate(['/']);
  }



  get todoCount(): number {
    return this.todoTasks.length;
  }

  get inProgressCount(): number {
    return this.inProgressTasks.length;
  }

  get completedCount(): number {
    return this.completedTasks.length;
  }

}