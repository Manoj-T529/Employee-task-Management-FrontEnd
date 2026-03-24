import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';

import { MaterialModule } from '../shared/material.module';
import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import { AuthService } from '../services/auth.service';
import { AdminUserService } from '../services/admin-user.service';
import { CommentsDialogComponent } from '../features/tasks/comments-dialog.component';

// Task model import removed to prevent strict-type errors
import { Project } from '../models/project.model';

const STATUS_MAP: {[key: number]: string } = {
  1: 'To Do',
  2: 'In Progress',
  3: 'Completed'
};

const STATUS_NAME_TO_ID: { [key: string]: number } = {
  'To Do': 1,
  'In Progress': 2,
  'Completed': 3
};

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, DragDropModule],
  templateUrl: './employee.html',
  styleUrls: ['./employee.css']
})
export class Employee implements OnInit {
  projects: Project[] = [];
  users: any[] =[];
  selectedProjectId: string = '';

  // 1. CHANGED FROM Task[] TO any[] TO FIX TS2339 ERRORS
  todoTasks: any[] = [];
  inProgressTasks: any[] = [];
  completedTasks: any[] = [];

  readonly STATUSES = ['To Do', 'In Progress', 'Completed'];

  constructor(
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly adminUserService: AdminUserService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadUsers();
  }

  // ================= LOAD DATA =================
  private loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects: Project[]) => {
        this.projects = projects;
        if (projects.length > 0) {
          this.selectedProjectId = projects[0].id;
          this.loadBoard(this.selectedProjectId);
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadUsers() {
    // 2. CHANGED TO getAllUsers() SO ADMIN AVATARS & COMMENTS SHOW UP PROPERLY!
    this.adminUserService.getAllUsers().subscribe((r: any) => {
      const dataArray = r.data?.data || r.data || r; 
      this.users = Array.isArray(dataArray) 
        ? dataArray.filter((u: any) => !u.email?.includes('_deleted_'))
        :[];
    });
  }

  onProjectChange(projectId: string): void {
    this.selectedProjectId = projectId;
    this.loadBoard(projectId);
  }

  private loadBoard(projectId: string): void {
    this.taskService.getBoard(projectId).subscribe({
      next: (board: any) => {
        this.todoTasks = board.TODO ||[];
        this.inProgressTasks = board.IN_PROGRESS || [];
        this.completedTasks = board.DONE ||[];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // ================= DRAG AND DROP =================
  // 3. CHANGED CdkDragDrop<Task[]> to CdkDragDrop<any[]>
  drop(event: CdkDragDrop<any[]>, newStatusName: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const movedTask = event.container.data[event.currentIndex];
    const newStatusId = STATUS_NAME_TO_ID[newStatusName];
    movedTask.status_id = newStatusId;

    this.taskService.updateStatus(movedTask.id, newStatusId).subscribe({
      error: err => {
        console.error('Failed to update status', err);
        this.loadBoard(this.selectedProjectId); // Rollback board if API fails
      }
    });
  }

  // ================= STATUS SELECT =================
  changeStatus(taskId: string, statusName: string): void {
    const newId = STATUS_NAME_TO_ID[statusName];
    this.taskService.updateStatus(taskId, newId).subscribe({
      next: () => this.loadBoard(this.selectedProjectId),
      error: err => console.error(err)
    });
  }

  // 4. CHANGED task: Task to task: any
  getStatusName(task: any): string {
    return STATUS_MAP[task.status_id];
  }

  // ================= UTILS & DIALOGS =================
  getAvatar(userId: string) {
    if (!Array.isArray(this.users)) return 'EM';
    const u = this.users.find(x => x.id === userId);
    
    if (!u) {
      // Check if the assigned user is the current logged-in user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id === userId) return 'ME';
      return '??';
    }
    
    const name = u.first_name || u.name || u.username || u.email || '??';
    return name.substring(0, 2).toUpperCase();
  }

  openCommentsDialog(task: any) {
    this.dialog.open(CommentsDialogComponent, {
      width: '500px',
      panelClass: 'premium-dialog',
      data: { task: task, users: this.users }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  // ================= GETTERS =================
  get todoCount(): number { return this.todoTasks.length; }
  get inProgressCount(): number { return this.inProgressTasks.length; }
  get completedCount(): number { return this.completedTasks.length; }
}