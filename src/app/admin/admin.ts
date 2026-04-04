

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';

import { MaterialModule } from '../shared/material.module';
import { CalendarComponent } from '../features/calendar/calendar.component';
import { TaskDialogComponent } from '../features/tasks/task-dialog';
import { CommentsDialogComponent } from '../features/tasks/comments-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import { AdminUserService } from '../services/admin-user.service';
import { AuthService } from '../services/auth.service';
													 
																	
										 
																						   
import { ToastService } from '../shared/ui/toast.service';
import { Project, User, Task, Board, AuditLog } from '../models/types'; // Import strict types

@Component({
  selector: 'app-admin',
  standalone: true,
			
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CalendarComponent, DragDropModule],
									 
	
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // FAANG: Memory Leak Prevention

  view: string = 'dashboard';
  projects: Project[] = [];
  users: User[] = [];
  allUsers: User[] = [];
  globalAuditLogs: AuditLog[] = [];

  selectedProject: Project | null = null;
  selectedProjectId: string = '';
  
  isLoadingProjects: boolean = true;
  isLoadingBoard: boolean = false;

  board: Board = { TODO: [], IN_PROGRESS: [], DONE: [] };

				 
  task: Partial<Task> = { title: '', description: '', project_id: '', priority_id: 2, story_points: undefined, start_date: undefined, due_date: undefined, task_assignees: [] as any };
  newProject: Partial<Project> = { name: '', description: '', start_date: undefined, end_date: undefined };
  employee: Partial<User> & { password?: string } = { first_name: '', last_name: '', username: '', email: '', password: '', role: 'EMPLOYEE' };
					

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private adminService: AdminUserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // FAANG: Parallel loading reduces TTFB (Time To First Byte) bottleneck
  private loadInitialData() {
    this.isLoadingProjects = true;
    
    forkJoin({
      projects: this.projectService.getProjects(),
      employees: this.adminService.getEmployees(),
      allUsers: this.adminService.getAllUsers()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        this.projects = res.projects;
        this.users = (res.employees.data || res.employees).filter((u: User) => !u.email?.includes('_deleted_'));
        this.allUsers = (res.allUsers.data?.data || res.allUsers.data || res.allUsers).filter((u: User) => !u.email?.includes('_deleted_'));
        this.isLoadingProjects = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('Failed to load dashboard data');
        this.isLoadingProjects = false;
      }
    });
  }

  // Getters for UI
  get activeUsers() { return this.users.filter(u => u.status === 'ACTIVE').length; }
  get inactiveUsers() { return this.users.filter(u => u.status !== 'ACTIVE').length; }
  get totalProjects() { return this.projects.length; }

  get todoCount() { return this.board.TODO?.length || 0; }
  get inProgressCount() { return this.board.IN_PROGRESS?.length || 0; }
  get doneCount() { return this.board.DONE?.length || 0; }
  get totalBoardTasks() { return this.todoCount + this.inProgressCount + this.doneCount; }
		  
  setView(v: string) { 
    this.view = v; 
						   
    if (v === 'activity') this.loadGlobalActivity();
	 
  }

  loadGlobalActivity() {
    this.adminService.getGlobalActivity()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
																			   
          this.globalAuditLogs = res.data?.data || res.data || res || [];
          this.cdr.detectChanges();
        },
					   
															 
        error: () => this.toast.error('Failed to load activity logs')
      });
	   
  }

  openProject(p: Project) {
    this.selectedProject = p;
    this.selectedProjectId = p.id;
    this.view = 'board';
    this.loadBoard(p.id);
  }
  changeProject() {
    if (!this.selectedProjectId) return;
    const project = this.projects.find(p => p.id === this.selectedProjectId);
    if (project) this.openProject(project);
  }


  loadBoard(id: string) {
    this.isLoadingBoard = true;
    this.taskService.getBoard(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (r: any) => {
          this.board = { TODO: r.TODO || [], IN_PROGRESS: r.IN_PROGRESS || [], DONE: r.DONE || [] };
          this.isLoadingBoard = false;
          this.cdr.detectChanges(); 
        },
        error: () => {
          this.toast.error('Failed to load board');
          this.isLoadingBoard = false;
        }
      });
  }

  drop(event: CdkDragDrop<Task[]>, status: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;															 
    }
   

    // 1. Instantly update UI (Optimistic)
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    
    const task = event.container.data[event.currentIndex];
    const statusId = status === 'TODO' ? 1 : (status === 'IN_PROGRESS' ? 2 : 3);

    // 2. Fire Backend request
    this.taskService.updateStatus(task.id, statusId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => {
          // 3. Rollback if backend fails (e.g. Rate limit hit)
          this.toast.error('Failed to move task. Reverting...');
          transferArrayItem(event.container.data, event.previousContainer.data, event.currentIndex, event.previousIndex);									  
        }
      });
  }

  openCommentsDialog(event: Event, task: Task) {
    event.stopPropagation();
    this.dialog.open(CommentsDialogComponent, {
      width: '500px', panelClass: 'premium-dialog',
      data: { task, users: this.allUsers }
    }); 
  }

  openTaskDialog(task: Task) {
    const ref = this.dialog.open(TaskDialogComponent, {
      width: '560px', panelClass: 'premium-dialog',
      data: { ...task, users: this.allUsers } 
    });

    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(updated => {
      if (updated && this.selectedProject) this.loadBoard(this.selectedProject.id);																			     
    });
  
  }

  loadProjects() {
    this.isLoadingProjects = true;
    this.projectService.getProjects().subscribe(r => {
      this.projects = r;
      this.isLoadingProjects = false; // Turn off skeleton
      this.cdr.detectChanges();
    });
  }

    loadAllUsers() {
    this.adminService.getAllUsers().subscribe((r: any) => {
      // Backend returns { status: "success", data: { data: [...], total: X } } or similar based on pagination
      const dataArray = r.data?.data || r.data || r; 
      
      this.allUsers = Array.isArray(dataArray) 
        ? dataArray.filter((u: any) => !u.email?.includes('_deleted_'))
        :[];
    });
  }
loadUsers() {
    this.adminService.getEmployees().subscribe((r: any) => {
      const dataArray = r.data || r;
      this.users = Array.isArray(dataArray) 
        ? dataArray.filter((u: any) => !u.email?.includes('_deleted_'))
        :[];
    });
  }

 // --- FETCH & OPEN TASK FROM ACTIVITY LOG ---
  fetchAndOpenTask(event: Event, taskId: string) {
    // 1. Stop the click event so it doesn't ALSO trigger the row's expand/collapse
    event.stopPropagation(); 
																				

    // 2. Fetch the specific task using your TaskService
    this.taskService.getTaskById(taskId).subscribe({
									 
				  
      next: (res: any) => {
        // Depending on your backend, the task might be wrapped in a 'data' object
        const taskDetails = res.data || res; 
        
        if (taskDetails) {
          this.openTaskDialog(taskDetails);
        } else {
          this.toast.error('Task not found.');
        }
      },
      error: (err: any) => {
        console.error('Error fetching task:', err);
        this.toast.error('Could not load task. It may have been deleted.');
      }
    });
  }


  // Uses task_assignees array generated by backend
  getAvatar(userId: string) {
    if (!Array.isArray(this.allUsers)) return '?'; 
    const u = this.allUsers.find(x => x.id === userId);
    if (!u) return '?';
    const name = u.first_name || u.last_name || u.username || u.email || '?';
    return name.substring(0, 2).toUpperCase();
  }

  createProject() {
  this.projectService.createProject(this.newProject).subscribe(() => {
    this.toast.success('Workspace created successfully!');
    this.newProject = { name: '', description: '' };
    this.loadProjects();
    this.setView('dashboard');
  });
}

  createTask() {
  this.taskService.createTask(this.task).subscribe(() => {
    this.toast.success('Issue created successfully!');
    this.task = { title: '', project_id: '', priority_id: 2, task_assignees: [], due_date: '' };
    if (this.selectedProject) this.loadBoard(this.selectedProject.id);
    this.setView('board');
  });
}

 createEmployee() {
  this.adminService.createEmployee(this.employee).subscribe(() => {
    this.toast.success('Invitation sent to ' + this.employee.email);
    this.employee = { username: '', email: '', password: '' };
    this.loadUsers();
    this.setView('employees');
  });
}

 deleteProject(event: Event, id: string) {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', panelClass: 'premium-dialog',
      data: { title: 'Delete Workspace', message: 'Are you sure you want to permanently delete this workspace and all its tasks? This cannot be undone.' }
    });

    ref.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.projectService.deleteProject(id).subscribe(() => {
          if (this.selectedProjectId === id) { this.selectedProjectId = ''; this.selectedProject = null; this.view = 'dashboard'; }
          this.loadProjects();
        });
      }
    });
  }

  deleteEmployee(id: any) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', panelClass: 'premium-dialog',
      data: { title: 'Remove Teammate', message: 'Are you sure you want to remove this employee from the organization?' }
    });

    ref.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.adminService.deleteEmployee(id).subscribe(() => this.loadUsers());
      }
    });
  }


  // ================= DELETE TASK (Optimistic UI) =================
  deleteTask(event: Event, taskId: string) {
    event.stopPropagation();

    // 1. Open the Premium FAANG-style dialog
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', 
      panelClass: 'premium-dialog',
      data: { 
        title: 'Delete Issue', 
        message: 'Are you sure you want to delete this issue? This cannot be undone.' 
      }
    });

    // 2. Wait for user response
    ref.afterClosed().subscribe(confirm => {
      if (confirm) {
        
        // 3. Optimistic UI Update (Instantly remove from view)
        this.board.TODO = this.board.TODO.filter(t => t.id !== taskId);
        this.board.IN_PROGRESS = this.board.IN_PROGRESS.filter(t => t.id !== taskId);
        this.board.DONE = this.board.DONE.filter(t => t.id !== taskId);
        this.cdr.detectChanges(); // Force Angular to redraw the screen instantly

        // 4. Fire Backend Call
        this.taskService.deleteTask(taskId).pipe(takeUntil(this.destroy$)).subscribe({
          error: (err) => {
            console.error("Deletion failed", err);
            // Replaced ugly alert() with your premium Toast notification
            this.toast.error("Failed to delete task. Reverting..."); 
            
            // 5. Rollback on failure
            this.loadBoard(this.selectedProjectId);
          }
        });
      }
    });
  }

  // --- ACTIVITY LOG HELPERS ---

  // 1. Resolve User ID to Real Name
  getUserName(userId: string): string {
    // Make sure we check against allUsers (so we find them even if inactive)
    const u = this.allUsers?.find(x => x.id === userId);
    if (u) {
      return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || 'Unknown User';
    }
    return 'User ' + userId.substring(0, 8); // Fallback
  }

  // 2. Translate technical logs into human-readable sentences
  formatLogMessage(log: any): string {
    const action = log.action?.toUpperCase();
    const entityType = log.entity_type?.toUpperCase();
    const entityId = log.entity_id || '';

    // If it's an API Middleware Log (What you currently have)
    if (entityType === 'API') {
      if (entityId.includes('/status')) return `updated a task's status`;
      if (entityId.includes('/tasks') && action === 'POST') return `created a new task`;
      if (entityId.includes('/tasks') && (action === 'PATCH' || action === 'PUT')) return `updated task details`;
      if (entityId.includes('/tasks') && action === 'DELETE') return `deleted a task`;
      
      if (entityId.includes('/projects') && action === 'POST') return `created a new workspace`;
      if (entityId.includes('/projects') && action === 'DELETE') return `deleted a workspace`;
      
      return `made an API ${action} request`; // Fallback
    }

    // If you start using Domain Service Logs (e.g. TASK, PROJECT)
    if (entityType === 'TASK') {
      if (action === 'STATUS_UPDATED') return `changed the status of task`;
      if (action === 'TASK_CREATED') return `created a new task`;
      if (action === 'DETAILS_UPDATED') return `updated task details`;
    }

    return `${log.action} on ${log.entity_type}`;
  }

  // 3. Choose a colored icon based on the action
  getLogIcon(log: any): string {
    const action = log.action?.toUpperCase();
    if (action?.includes('POST') || action?.includes('CREATED')) return 'add_circle';
    if (action?.includes('PATCH') || action?.includes('PUT') || action?.includes('UPDATED')) return 'edit';
    if (action?.includes('DELETE')) return 'delete';
    return 'info';
  }

  // 4. Color code the icons
  getLogColor(log: any): string {
    const action = log.action?.toUpperCase();
    if (action?.includes('POST') || action?.includes('CREATED')) return '#34d399'; // Emerald Green
    if (action?.includes('PATCH') || action?.includes('PUT') || action?.includes('UPDATED')) return '#fbbf24'; // Amber
    if (action?.includes('DELETE')) return '#f87171'; // Red
    return '#818cf8'; // Indigo
  }

  // --- DIFF/EXPAND HELPERS ---

  toggleLogDetails(log: any) {
    // Toggles the accordion open/closed
    log.expanded = !log.expanded;
  }

  getLogChanges(log: any): { key: string, oldVal: any, newVal: any }[] {
    const changes: any[] =[];
    
    const oldVal = typeof log.old_value === 'string' ? JSON.parse(log.old_value) : (log.old_value || {});
    const newVal = typeof log.new_value === 'string' ? JSON.parse(log.new_value) : (log.new_value || {});
    
    const allKeys = Array.from(new Set([...Object.keys(oldVal), ...Object.keys(newVal)]));
    
    // 🛑 ADD THIS: List of internal database or API keys to hide from the user
    const ignoredKeys =[
      'id', 'updated_at', 'created_at', 'deleted_at', 
      'statusCode', 'StatusCode', 'method', 'url', 'ip', 'project_id'
    ];
    
    for (const key of allKeys) {
      if (ignoredKeys.includes(key)) continue;

      const oldStr = JSON.stringify(oldVal[key]);
      const newStr = JSON.stringify(newVal[key]);

      if (oldStr !== newStr) {
        changes.push({
          key: this.formatKeyName(key),
          oldVal: this.formatValue(key, oldVal[key]),
          newVal: this.formatValue(key, newVal[key])
        });
      }
    }
    return changes;
  }

 formatKeyName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1') // Split camelCase (e.g. statusCode -> status Code)
      .replace(/_id$/, '')        // Remove '_id' (e.g. priority_id -> priority)
      .replace(/_/g, ' ')         // Replace underscores with spaces
      .trim()
      .replace(/^./, str => str.toUpperCase()); // Capitalize the very first letter
  }
  // Translates raw DB values into human-readable text (like translating status 1 to 'To Do')
  formatValue(key: string, value: any): string {
    if (value === null || value === undefined || value === '') return 'None';
    
    if (key.includes('status')) {
      if (String(value) === '1') return 'To Do';
      if (String(value) === '2') return 'In Progress';
      if (String(value) === '3') return 'Done';
    }
    
    if (key.includes('priority')) {
      if (String(value) === '1') return 'Low';
      if (String(value) === '2') return 'Medium';
      if (String(value) === '3') return 'High';
    }

    return String(value);
  }

  logout() {
    this.authService.logout().subscribe(() => this.router.navigate(['/']));
  }
											  
}												   
																							 			 





// import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
// import { MaterialModule } from '../shared/material.module';
// import { CalendarComponent } from '../features/calendar/calendar.component';
// import { TaskService } from '../services/task.service';
// import { ProjectService } from '../services/project.service';
// import { AdminUserService } from '../services/admin-user.service';
// import { AuthService } from '../services/auth.service';
// import { MatDialog } from '@angular/material/dialog';
// import { TaskDialogComponent } from '../features/tasks/task-dialog';
// import { Router } from '@angular/router';
// import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
// import { ToastService } from '../shared/ui/toast.service';
// import { CommentsDialogComponent } from '../features/tasks/comments-dialog.component';

// @Component({
//   selector: 'app-admin',
//   standalone: true,
//   imports: [
//     CommonModule, FormsModule, ReactiveFormsModule, MaterialModule,
//     CalendarComponent, DragDropModule
//   ],
//   templateUrl: './admin.html',
//   styleUrls: ['./admin.css']
// })
// export class Admin implements OnInit {
//   view: string = 'dashboard';
//   projects: any[] = [];
//   users: any[] = [];
//    allUsers: any[] =[];
//    globalAuditLogs: any[] =[];

//   selectedProject: any = null;
//   selectedProjectId: string = '';
//   isLoadingProjects: boolean = true;
//   isLoadingBoard: boolean = false;

//   board: any = { TODO: [], IN_PROGRESS: [], DONE: [] };

//    task: any = { 
//     title: '', description: '', project_id: '', priority_id: 2, 
//     story_points: null, start_date: null, due_date: null, assignees: [] 
//   };
//   employee: any = { 
//     first_name: '', last_name: '', username: '', 
//     email: '', password: '', role: 'EMPLOYEE' 
//   };

//   // API Aligned Project Model
//   newProject: any = { 
//     name: '', description: '', start_date: null, end_date: null 
//   };

//   constructor(
//     private taskService: TaskService,
//     private projectService: ProjectService,
//     private adminService: AdminUserService,
//     private authService: AuthService,
//     private dialog: MatDialog,
//     private router: Router,
//     private toast: ToastService,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     this.loadProjects();
//     this.loadUsers();
//      this.loadAllUsers(); 
//   }

//   get activeUsers() { return this.users.filter(u => u.status === 'ACTIVE').length; }
//   get inactiveUsers() { return this.users.filter(u => u.status !== 'ACTIVE').length; }
//   get totalProjects() { return this.projects.length; }

//   get todoCount() { return this.board.TODO?.length || 0; }
//   get inProgressCount() { return this.board.IN_PROGRESS?.length || 0; }
//   get doneCount() { return this.board.DONE?.length || 0; }
//   get totalBoardTasks() { return this.todoCount + this.inProgressCount + this.doneCount; }

//   // ================= OPEN COMMENTS =================
//   openCommentsDialog(event: Event, task: any) {
//     event.stopPropagation(); // Stop task edit dialog from opening
//     this.dialog.open(CommentsDialogComponent, {
//       width: '500px',
//       panelClass: 'premium-dialog',
//       data: { task: task, users: this.allUsers }
//     });
//   }

//   logout() {
//     this.authService.logout().subscribe(() => this.router.navigate(['/']));
//   }

//   // setView(v: string) { this.view = v; }

//   setView(v: string) { 
//     this.view = v; 
//     if (v === 'activity') {
//       this.loadGlobalActivity();
//     }
//   }

//    loadGlobalActivity() {
//     this.adminService.getGlobalActivity().subscribe({
//       next: (res: any) => {
//         // Safely extract the data depending on your backend response structure
//         this.globalAuditLogs = res.data?.data || res.data || res ||[];
//         this.cdr.detectChanges(); // Force UI update
//       },
//       error: (err) => {
//         console.error('Failed to load global activity', err);
//         this.toast.error('Failed to load activity logs');
//       }
//     });
//   }

//   // projectService.getProjects() handles pagination mapping {data, meta}
//   loadProjects() {
//     this.isLoadingProjects = true;
//     this.projectService.getProjects().subscribe(r => {
//       this.projects = r;
//       this.isLoadingProjects = false; // Turn off skeleton
//       this.cdr.detectChanges();
//     });
//   }

//     loadAllUsers() {
//     this.adminService.getAllUsers().subscribe((r: any) => {
//       // Backend returns { status: "success", data: { data: [...], total: X } } or similar based on pagination
//       const dataArray = r.data?.data || r.data || r; 
      
//       this.allUsers = Array.isArray(dataArray) 
//         ? dataArray.filter((u: any) => !u.email?.includes('_deleted_'))
//         :[];
//     });
//   }
// loadUsers() {
//     this.adminService.getEmployees().subscribe((r: any) => {
//       const dataArray = r.data || r;
//       this.users = Array.isArray(dataArray) 
//         ? dataArray.filter((u: any) => !u.email?.includes('_deleted_'))
//         :[];
//     });
//   }
 

//   // loadUsers() {
//   //    this.adminService.getEmployees().subscribe(r => {
//   //     // Filter out users that have been soft-deleted
//   //     this.users = r.filter((u: any) => !u.email.includes('_deleted_'));
//   //   });
//   // }

//   changeProject() {
//     if (!this.selectedProjectId) return;
//     const project = this.projects.find(p => p.id === this.selectedProjectId);
//     if (project) this.openProject(project);
//   }

//   openProject(p: any) {
//     this.selectedProject = p;
//     this.selectedProjectId = p.id;
//     this.view = 'board';
//     this.loadBoard(p.id);
//   }

//    loadBoard(id: string) {
//     this.isLoadingBoard = true;
//     this.taskService.getBoard(id).subscribe((r: any) => {
//       this.board = { TODO: r.TODO || [], IN_PROGRESS: r.IN_PROGRESS || [], DONE: r.DONE || [] };
//       this.isLoadingBoard = false; // Turn off skeleton
//        this.cdr.detectChanges(); 
//     });
//   }

//   getStatusId(s: string) {
//     if (s === 'TODO') return 1;
//     if (s === 'IN_PROGRESS') return 2;
//     if (s === 'DONE') return 3;
//     return 1;
//   }

//   drop(event: CdkDragDrop<any[]>, status: string) {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
//       const task = event.container.data[event.currentIndex];
//       const statusId = this.getStatusId(status);
//       this.taskService.updateStatus(task.id, statusId).subscribe({
//         error: () => this.loadBoard(this.selectedProject.id)
//       });
//     }
//   }

//   // --- FETCH & OPEN TASK FROM ACTIVITY LOG ---
//   fetchAndOpenTask(event: Event, taskId: string) {
//     // 1. Stop the click event so it doesn't ALSO trigger the row's expand/collapse
//     event.stopPropagation(); 

//     // 2. Fetch the specific task using your TaskService
//     this.taskService.getTaskById(taskId).subscribe({
//       next: (res: any) => {
//         // Depending on your backend, the task might be wrapped in a 'data' object
//         const taskDetails = res.data || res; 
        
//         if (taskDetails) {
//           this.openTaskDialog(taskDetails);
//         } else {
//           this.toast.error('Task not found.');
//         }
//       },
//       error: (err: any) => {
//         console.error('Error fetching task:', err);
//         this.toast.error('Could not load task. It may have been deleted.');
//       }
//     });
//   }

//   openTaskDialog(task: any) {
//     const ref = this.dialog.open(TaskDialogComponent, {
//       width: '560px',
//       panelClass: 'premium-dialog',
//       data: { ...task, users: this.allUsers } 
//     });

//     ref.afterClosed().subscribe(updated => {
//       if (updated) this.loadBoard(this.selectedProject.id);
//     });
//   }

//   // Uses task_assignees array generated by backend
//   getAvatar(userId: string) {
//     if (!Array.isArray(this.allUsers)) return '?'; 
//     const u = this.allUsers.find(x => x.id === userId);
//     if (!u) return '?';
//     const name = u.first_name || u.name || u.username || u.email || '?';
//     return name.substring(0, 2).toUpperCase();
//   }

//   createProject() {
//   this.projectService.createProject(this.newProject).subscribe(() => {
//     this.toast.success('Workspace created successfully!');
//     this.newProject = { name: '', description: '' };
//     this.loadProjects();
//     this.setView('dashboard');
//   });
// }

//   createTask() {
//   this.taskService.createTask(this.task).subscribe(() => {
//     this.toast.success('Issue created successfully!');
//     this.task = { title: '', project_id: '', priority_id: 2, assignees: [], due_date: null };
//     if (this.selectedProject) this.loadBoard(this.selectedProject.id);
//     this.setView('board');
//   });
// }

//  createEmployee() {
//   this.adminService.createEmployee(this.employee).subscribe(() => {
//     this.toast.success('Invitation sent to ' + this.employee.email);
//     this.employee = { name: '', email: '', password: '' };
//     this.loadUsers();
//     this.setView('employees');
//   });
// }

//  deleteProject(event: Event, id: string) {
//     event.stopPropagation();
//     const ref = this.dialog.open(ConfirmDialogComponent, {
//       width: '400px', panelClass: 'premium-dialog',
//       data: { title: 'Delete Workspace', message: 'Are you sure you want to permanently delete this workspace and all its tasks? This cannot be undone.' }
//     });

//     ref.afterClosed().subscribe(confirm => {
//       if (confirm) {
//         this.projectService.deleteProject(id).subscribe(() => {
//           if (this.selectedProjectId === id) { this.selectedProjectId = ''; this.selectedProject = null; this.view = 'dashboard'; }
//           this.loadProjects();
//         });
//       }
//     });
//   }

//   deleteEmployee(id: any) {
//     const ref = this.dialog.open(ConfirmDialogComponent, {
//       width: '400px', panelClass: 'premium-dialog',
//       data: { title: 'Remove Teammate', message: 'Are you sure you want to remove this employee from the organization?' }
//     });

//     ref.afterClosed().subscribe(confirm => {
//       if (confirm) {
//         this.adminService.deleteEmployee(id).subscribe(() => this.loadUsers());
//       }
//     });
//   }

//   deleteTask(event: Event, id: string) {
//     event.stopPropagation(); // Prevents opening the edit dialog
//     const ref = this.dialog.open(ConfirmDialogComponent, {
//       width: '400px', panelClass: 'premium-dialog',
//       data: { title: 'Delete Issue', message: 'Are you sure you want to delete this issue?' }
//     });

//     ref.afterClosed().subscribe(confirm => {
//       if (confirm) {
//         this.taskService.deleteTask(id).subscribe(() => this.loadBoard(this.selectedProject.id));
//       }
//     });
//   }

//   // --- ACTIVITY LOG HELPERS ---

//   // 1. Resolve User ID to Real Name
//   getUserName(userId: string): string {
//     // Make sure we check against allUsers (so we find them even if inactive)
//     const u = this.allUsers?.find(x => x.id === userId);
//     if (u) {
//       return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || 'Unknown User';
//     }
//     return 'User ' + userId.substring(0, 8); // Fallback
//   }

//   // 2. Translate technical logs into human-readable sentences
//   formatLogMessage(log: any): string {
//     const action = log.action?.toUpperCase();
//     const entityType = log.entity_type?.toUpperCase();
//     const entityId = log.entity_id || '';

//     // If it's an API Middleware Log (What you currently have)
//     if (entityType === 'API') {
//       if (entityId.includes('/status')) return `updated a task's status`;
//       if (entityId.includes('/tasks') && action === 'POST') return `created a new task`;
//       if (entityId.includes('/tasks') && (action === 'PATCH' || action === 'PUT')) return `updated task details`;
//       if (entityId.includes('/tasks') && action === 'DELETE') return `deleted a task`;
      
//       if (entityId.includes('/projects') && action === 'POST') return `created a new workspace`;
//       if (entityId.includes('/projects') && action === 'DELETE') return `deleted a workspace`;
      
//       return `made an API ${action} request`; // Fallback
//     }

//     // If you start using Domain Service Logs (e.g. TASK, PROJECT)
//     if (entityType === 'TASK') {
//       if (action === 'STATUS_UPDATED') return `changed the status of task`;
//       if (action === 'TASK_CREATED') return `created a new task`;
//       if (action === 'DETAILS_UPDATED') return `updated task details`;
//     }

//     return `${log.action} on ${log.entity_type}`;
//   }

//   // 3. Choose a colored icon based on the action
//   getLogIcon(log: any): string {
//     const action = log.action?.toUpperCase();
//     if (action?.includes('POST') || action?.includes('CREATED')) return 'add_circle';
//     if (action?.includes('PATCH') || action?.includes('PUT') || action?.includes('UPDATED')) return 'edit';
//     if (action?.includes('DELETE')) return 'delete';
//     return 'info';
//   }

//   // 4. Color code the icons
//   getLogColor(log: any): string {
//     const action = log.action?.toUpperCase();
//     if (action?.includes('POST') || action?.includes('CREATED')) return '#34d399'; // Emerald Green
//     if (action?.includes('PATCH') || action?.includes('PUT') || action?.includes('UPDATED')) return '#fbbf24'; // Amber
//     if (action?.includes('DELETE')) return '#f87171'; // Red
//     return '#818cf8'; // Indigo
//   }

//   // --- DIFF/EXPAND HELPERS ---

//   toggleLogDetails(log: any) {
//     // Toggles the accordion open/closed
//     log.expanded = !log.expanded;
//   }

//   getLogChanges(log: any): { key: string, oldVal: any, newVal: any }[] {
//     const changes: any[] =[];
    
//     const oldVal = typeof log.old_value === 'string' ? JSON.parse(log.old_value) : (log.old_value || {});
//     const newVal = typeof log.new_value === 'string' ? JSON.parse(log.new_value) : (log.new_value || {});
    
//     const allKeys = Array.from(new Set([...Object.keys(oldVal), ...Object.keys(newVal)]));
    
//     // 🛑 ADD THIS: List of internal database or API keys to hide from the user
//     const ignoredKeys =[
//       'id', 'updated_at', 'created_at', 'deleted_at', 
//       'statusCode', 'StatusCode', 'method', 'url', 'ip', 'project_id'
//     ];
    
//     for (const key of allKeys) {
//       if (ignoredKeys.includes(key)) continue;

//       const oldStr = JSON.stringify(oldVal[key]);
//       const newStr = JSON.stringify(newVal[key]);

//       if (oldStr !== newStr) {
//         changes.push({
//           key: this.formatKeyName(key),
//           oldVal: this.formatValue(key, oldVal[key]),
//           newVal: this.formatValue(key, newVal[key])
//         });
//       }
//     }
//     return changes;
//   }

//  formatKeyName(key: string): string {
//     return key
//       .replace(/([A-Z])/g, ' $1') // Split camelCase (e.g. statusCode -> status Code)
//       .replace(/_id$/, '')        // Remove '_id' (e.g. priority_id -> priority)
//       .replace(/_/g, ' ')         // Replace underscores with spaces
//       .trim()
//       .replace(/^./, str => str.toUpperCase()); // Capitalize the very first letter
//   }
//   // Translates raw DB values into human-readable text (like translating status 1 to 'To Do')
//   formatValue(key: string, value: any): string {
//     if (value === null || value === undefined || value === '') return 'None';
    
//     if (key.includes('status')) {
//       if (String(value) === '1') return 'To Do';
//       if (String(value) === '2') return 'In Progress';
//       if (String(value) === '3') return 'Done';
//     }
    
//     if (key.includes('priority')) {
//       if (String(value) === '1') return 'Low';
//       if (String(value) === '2') return 'Medium';
//       if (String(value) === '3') return 'High';
//     }

//     return String(value);
//   }
// }