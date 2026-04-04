import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { Subject, forkJoin, takeUntil } from 'rxjs';

import { MaterialModule } from '../shared/material.module';
import { CalendarComponent } from '../features/calendar/calendar.component';
import { CommentsDialogComponent } from '../features/tasks/comments-dialog.component';

import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import { AuthService } from '../services/auth.service';
import { AdminUserService } from '../services/admin-user.service';
import { Project, Task, User, Board } from '../models/types';

const STATUS_MAP: Record<number, string> = { 1: 'To Do', 2: 'In Progress', 3: 'Completed' };

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, DragDropModule, CalendarComponent],
  templateUrl: './employee.html',
  styleUrls: ['./employee.css']
})
export class Employee implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  view: 'dashboard' | 'board' | 'calendar' = 'dashboard';
  currentUser: User | null = null;
  
  projects: Project[] = [];
  users: User[] = [];
  selectedProjectId: string = '';

  // 1. Raw Source of Truth
  rawTodo: Task[] = [];
  rawInProgress: Task[] = [];
  rawDone: Task[] = [];

  // 2. Physical Display Arrays (FIXES DRAG & DROP)
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  completedTasks: Task[] = [];

  // Filters
  searchQuery: string = '';
  onlyMyTasks: boolean = false;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private adminUserService: AdminUserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) this.currentUser = JSON.parse(userStr);

    forkJoin({
      projects: this.projectService.getProjects(),
      users: this.adminUserService.getAllUsers()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projects = res.projects;
        this.users = (res.users.data?.data || res.users.data || res.users).filter((u: User) => !u.email?.includes('_deleted_'));
        
        if (this.projects.length > 0) {
          this.selectedProjectId = this.projects[0].id;
          this.loadBoard(this.selectedProjectId);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setView(v: 'dashboard' | 'board' | 'calendar') {
    this.view = v;
  }

  changeProject() {
    if (this.selectedProjectId) this.loadBoard(this.selectedProjectId);
  }

  private loadBoard(projectId: string): void {
    this.taskService.getBoard(projectId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (board: Board) => {
        this.rawTodo = board.TODO || [];
        this.rawInProgress = board.IN_PROGRESS || [];
        this.rawDone = board.DONE || [];
        this.applyFilters(); // Apply filters immediately upon loading
      }
    });
  }

  // ================= FILTERING LOGIC =================
  private filterTasks(tasks: Task[]): Task[] {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            t.id.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesMe = this.onlyMyTasks && this.currentUser 
        ? t.task_assignees?.some(a => a.user_id === this.currentUser!.id) 
        : true;

      return matchesSearch && matchesMe;
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  // Physical update of arrays for Drag & Drop safety
  private applyFilters() {
    this.todoTasks = this.filterTasks(this.rawTodo);
    this.inProgressTasks = this.filterTasks(this.rawInProgress);
    this.completedTasks = this.filterTasks(this.rawDone);
    this.cdr.detectChanges();
  }

  // ================= DASHBOARD STATS =================
  get myPendingTasks(): Task[] {
    if (!this.currentUser) return [];
    return [...this.rawTodo, ...this.rawInProgress].filter(t => 
      t.task_assignees?.some(a => a.user_id === this.currentUser!.id)
    );
  }

  get myCompletedCount(): number {
    if (!this.currentUser) return 0;
    return this.rawDone.filter(t => 
      t.task_assignees?.some(a => a.user_id === this.currentUser!.id)
    ).length;
  }

  // ================= DRAG AND DROP =================
  drop(event: CdkDragDrop<Task[]>, newStatusId: number): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    // 1. Optimistic Transfer
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

    const movedTask = event.container.data[event.currentIndex];
    const oldStatusId = movedTask.status_id;
    movedTask.status_id = newStatusId;

    // 2. Backend Call
    this.taskService.updateStatus(movedTask.id, newStatusId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // Refresh underlying raw arrays silently
        this.loadBoard(this.selectedProjectId); 
      },
      error: () => {
        // Rollback exact state if it fails
        transferArrayItem(event.container.data, event.previousContainer.data, event.currentIndex, event.previousIndex);
        movedTask.status_id = oldStatusId;
        this.cdr.detectChanges();
      }
    });
  }

  // ================= STATUS DROPDOWN =================
  changeStatus(task: Task, newStatusId: number): void {
    const oldStatusId = task.status_id; // Store old in case of fail
    
    // Note: ngModel already updated task.status_id, so we just call the API
    this.taskService.updateStatus(task.id, newStatusId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadBoard(this.selectedProjectId), // Reload to reshuffle columns
      error: () => {
        task.status_id = oldStatusId; // Rollback
        this.cdr.detectChanges();
      }
    });
  }

  // ================= UI HELPERS =================
  getAvatar(userId: string): string {
    if (this.currentUser && userId === this.currentUser.id) return 'ME';
    const u = this.users.find(x => x.id === userId);
    if (!u) return '??';
    const name = u.first_name || u.last_name || u.username || u.email || '??';
    return name.substring(0, 2).toUpperCase();
  }

  openCommentsDialog(task: Task) {
    this.dialog.open(CommentsDialogComponent, {
      width: '500px', panelClass: 'premium-dialog',
      data: { task, users: this.users }
    });
  }

  getStatusName(task: Task): string {
    return STATUS_MAP[task.status_id] || 'Unknown';
  }

  logout(): void {
    this.authService.logout().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}

// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
// import { MatDialog } from '@angular/material/dialog';
// import { Subject, forkJoin, takeUntil } from 'rxjs';

// import { MaterialModule } from '../shared/material.module';
// import { TaskService } from '../services/task.service';
// import { ProjectService } from '../services/project.service';
// import { AuthService } from '../services/auth.service';
// import { AdminUserService } from '../services/admin-user.service';
// import { CommentsDialogComponent } from '../features/tasks/comments-dialog.component';
// import { Project, Task, User, Board } from '../models/types';

// const STATUS_MAP: Record<number, string> = { 1: 'To Do', 2: 'In Progress', 3: 'Completed' };
// const STATUS_NAME_TO_ID: Record<string, number> = { 'To Do': 1, 'In Progress': 2, 'Completed': 3 };


// @Component({
//   selector: 'app-employee',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MaterialModule, DragDropModule],
//   templateUrl: './employee.html',
//   styleUrls: ['./employee.css']
// })
// export class Employee implements OnInit, OnDestroy {
//   private destroy$ = new Subject<void>();

//   projects: Project[] = [];
//   users: User[] = [];
//   selectedProjectId: string = '';

														 
//   todoTasks: Task[] = [];
//   inProgressTasks: Task[] = [];
//   completedTasks: Task[] = [];

//   readonly STATUSES = ['To Do', 'In Progress', 'Completed'];

//   constructor(
//     private taskService: TaskService,
//     private projectService: ProjectService,
//     private adminUserService: AdminUserService,
//     private authService: AuthService,
//     private router: Router,
//     private cdr: ChangeDetectorRef,
//     private dialog: MatDialog
//   ) {}

//   ngOnInit(): void {
//     // Parallel data fetch
//     forkJoin({
   

												  
								
//       projects: this.projectService.getProjects(),
//       users: this.adminUserService.getAllUsers()
//     }).pipe(takeUntil(this.destroy$)).subscribe({
//       next: (res: any) => {
//         this.projects = res.projects;
//         this.users = (res.users.data?.data || res.users.data || res.users).filter((u: User) => !u.email?.includes('_deleted_'));
        
//         if (this.projects.length > 0) {
//           this.selectedProjectId = this.projects[0].id;
//           this.loadBoard(this.selectedProjectId);
//         }
//       }
										
//     });
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
													 
											
																	   
			
	   
//   }

//   onProjectChange(projectId: string): void {
//     this.selectedProjectId = projectId;
//     this.loadBoard(projectId);
//   }

//   private loadBoard(projectId: string): void {
//     this.taskService.getBoard(projectId).pipe(takeUntil(this.destroy$)).subscribe({
//       next: (board: Board) => {
//         this.todoTasks = board.TODO || [];
//         this.inProgressTasks = board.IN_PROGRESS || [];
//         this.completedTasks = board.DONE || [];
//         this.cdr.detectChanges();
//       }
										
//     });
//   }

//   // FAANG Optimistic Update Rollback
														 
//   drop(event: CdkDragDrop<Task[]>, newStatusName: string): void {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//       return;
//     }

//     transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
								   
						   
						  
						
	  

//     const movedTask = event.container.data[event.currentIndex];
//     const newStatusId = STATUS_NAME_TO_ID[newStatusName];
//     movedTask.status_id = newStatusId;

//     this.taskService.updateStatus(movedTask.id, newStatusId).pipe(takeUntil(this.destroy$)).subscribe({
//       error: () => {
//         // Rollback on fail
//         transferArrayItem(event.container.data, event.previousContainer.data, event.currentIndex, event.previousIndex);
//         movedTask.status_id = STATUS_NAME_TO_ID[Object.keys(STATUS_NAME_TO_ID).find(k => STATUS_NAME_TO_ID[k] === Number(event.previousContainer.id)) || 'To Do'];
//       }
//     });
//   }

// // ================= STATUS SELECT =================
//   changeStatus(taskId: string, statusName: string): void {
//     const newId = STATUS_NAME_TO_ID[statusName];
//     this.taskService.updateStatus(taskId, newId).subscribe({
//       next: () => this.loadBoard(this.selectedProjectId),
//       error: err => console.error(err)
//     });
//   }

//   // 4. CHANGED task: Task to task: any
//   getStatusName(task: any): string {
//     return STATUS_MAP[task.status_id];
//   }

//   // ================= UTILS & DIALOGS =================
//   getAvatar(userId: string) {
//     if (!Array.isArray(this.users)) return 'EM';
//     const u = this.users.find(x => x.id === userId);
    
//     if (!u) {
//       // Check if the assigned user is the current logged-in user
//       const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
//       if (currentUser.id === userId) return 'ME';
//       return '??';
//     }
    
//     const name = u.first_name || u.username || u.username || u.email || '??';
//     return name.substring(0, 2).toUpperCase();
//   }

//   openCommentsDialog(task: any) {
//     this.dialog.open(CommentsDialogComponent, {
//       width: '500px',
//       panelClass: 'premium-dialog',
//       data: { task: task, users: this.users }
//     });
//   }

//   logout(): void {
//     this.authService.logout().subscribe(() => {
//       this.router.navigate(['/']);
//     });
//   }

//   // ================= GETTERS =================
//   get todoCount(): number { return this.todoTasks.length; }
//   get inProgressCount(): number { return this.inProgressTasks.length; }
//   get completedCount(): number { return this.completedTasks.length; }																	 
// }





// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
// import { MatDialog } from '@angular/material/dialog';

// import { MaterialModule } from '../shared/material.module';
// import { TaskService } from '../services/task.service';
// import { ProjectService } from '../services/project.service';
// import { AuthService } from '../services/auth.service';
// import { AdminUserService } from '../services/admin-user.service';
// import { CommentsDialogComponent } from '../features/tasks/comments-dialog.component';

// // Task model import removed to prevent strict-type errors
// import { Project } from '../models/project.model';

// const STATUS_MAP: {[key: number]: string } = {
//   1: 'To Do',
//   2: 'In Progress',
//   3: 'Completed'
// };

// const STATUS_NAME_TO_ID: { [key: string]: number } = {
//   'To Do': 1,
//   'In Progress': 2,
//   'Completed': 3
// };

// @Component({
//   selector: 'app-employee',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MaterialModule, DragDropModule],
//   templateUrl: './employee.html',
//   styleUrls: ['./employee.css']
// })
// export class Employee implements OnInit {
//   projects: Project[] = [];
//   users: any[] =[];
//   selectedProjectId: string = '';

//   // 1. CHANGED FROM Task[] TO any[] TO FIX TS2339 ERRORS
//   todoTasks: any[] = [];
//   inProgressTasks: any[] = [];
//   completedTasks: any[] = [];

//   readonly STATUSES = ['To Do', 'In Progress', 'Completed'];

//   constructor(
//     private readonly taskService: TaskService,
//     private readonly projectService: ProjectService,
//     private readonly adminUserService: AdminUserService,
//     private readonly authService: AuthService,
//     private readonly router: Router,
//     private readonly cdr: ChangeDetectorRef,
//     private dialog: MatDialog
//   ) {}

//   ngOnInit(): void {
//     this.loadProjects();
//     this.loadUsers();
//   }

//   // ================= LOAD DATA =================
//   private loadProjects(): void {
//     this.projectService.getProjects().subscribe({
//       next: (projects: Project[]) => {
//         this.projects = projects;
//         if (projects.length > 0) {
//           this.selectedProjectId = projects[0].id;
//           this.loadBoard(this.selectedProjectId);
//         }
//       },
//       error: (err) => console.error(err)
//     });
//   }

//   loadUsers() {
//     // 2. CHANGED TO getAllUsers() SO ADMIN AVATARS & COMMENTS SHOW UP PROPERLY!
//     this.adminUserService.getAllUsers().subscribe((r: any) => {
//       const dataArray = r.data?.data || r.data || r; 
//       this.users = Array.isArray(dataArray) 
//         ? dataArray.filter((u: any) => !u.email?.includes('_deleted_'))
//         :[];
//     });
//   }

//   onProjectChange(projectId: string): void {
//     this.selectedProjectId = projectId;
//     this.loadBoard(projectId);
//   }

//   private loadBoard(projectId: string): void {
//     this.taskService.getBoard(projectId).subscribe({
//       next: (board: any) => {
//         this.todoTasks = board.TODO ||[];
//         this.inProgressTasks = board.IN_PROGRESS || [];
//         this.completedTasks = board.DONE ||[];
//         this.cdr.detectChanges();
//       },
//       error: (err) => console.error(err)
//     });
//   }

//   // ================= DRAG AND DROP =================
//   // 3. CHANGED CdkDragDrop<Task[]> to CdkDragDrop<any[]>
//   drop(event: CdkDragDrop<any[]>, newStatusName: string): void {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//       return;
//     }

//     transferArrayItem(
//       event.previousContainer.data,
//       event.container.data,
//       event.previousIndex,
//       event.currentIndex
//     );

//     const movedTask = event.container.data[event.currentIndex];
//     const newStatusId = STATUS_NAME_TO_ID[newStatusName];
//     movedTask.status_id = newStatusId;

//     this.taskService.updateStatus(movedTask.id, newStatusId).subscribe({
//       error: err => {
//         console.error('Failed to update status', err);
//         this.loadBoard(this.selectedProjectId); // Rollback board if API fails
//       }
//     });
//   }

//   // ================= STATUS SELECT =================
//   changeStatus(taskId: string, statusName: string): void {
//     const newId = STATUS_NAME_TO_ID[statusName];
//     this.taskService.updateStatus(taskId, newId).subscribe({
//       next: () => this.loadBoard(this.selectedProjectId),
//       error: err => console.error(err)
//     });
//   }

//   // 4. CHANGED task: Task to task: any
//   getStatusName(task: any): string {
//     return STATUS_MAP[task.status_id];
//   }

//   // ================= UTILS & DIALOGS =================
//   getAvatar(userId: string) {
//     if (!Array.isArray(this.users)) return 'EM';
//     const u = this.users.find(x => x.id === userId);
    
//     if (!u) {
//       // Check if the assigned user is the current logged-in user
//       const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
//       if (currentUser.id === userId) return 'ME';
//       return '??';
//     }
    
//     const name = u.first_name || u.name || u.username || u.email || '??';
//     return name.substring(0, 2).toUpperCase();
//   }

//   openCommentsDialog(task: any) {
//     this.dialog.open(CommentsDialogComponent, {
//       width: '500px',
//       panelClass: 'premium-dialog',
//       data: { task: task, users: this.users }
//     });
//   }

//   logout(): void {
//     this.authService.logout().subscribe(() => {
//       this.router.navigate(['/']);
//     });
//   }

//   // ================= GETTERS =================
//   get todoCount(): number { return this.todoTasks.length; }
//   get inProgressCount(): number { return this.inProgressTasks.length; }
//   get completedCount(): number { return this.completedTasks.length; }
// }