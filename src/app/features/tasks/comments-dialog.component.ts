import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { TaskService } from '../../services/task.service';
import { Task, User, TaskComment } from '../../models/types'; // Strict typings

@Component({
  selector: 'app-comments-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-title">
        <div style="display: flex; align-items: center; gap: 10px;">
          <mat-icon style="color: #a855f7;">forum</mat-icon> 
          Comments: {{ task.id | slice:0:8 }}
        </div>
        <button class="icon-btn" (click)="close()"><mat-icon>close</mat-icon></button>
      </div>

      <div class="dialog-content comments-list">
        <div *ngIf="comments.length === 0" class="empty-comments">
          No comments yet. Start the conversation!
        </div>

        <div class="activity-item" *ngFor="let c of comments">
          <div class="avatar-sm">{{ getAvatar(c.user_id) }}</div>
          <div class="activity-content">
            <div class="comment-header">
              <strong>{{ getUserName(c.user_id) }}</strong>
              <span class="time">{{ c.created_at | date:'short' }}</span>
            </div>
            <div class="comment-bubble">{{ c.comment_text || c.text }}</div>
          </div>
        </div>
      </div>

      <div class="comment-box">
        <input 
          type="text" 
          placeholder="Write a comment..." 
          [(ngModel)]="newComment" 
          (keyup.enter)="postComment()"
          [disabled]="isPosting"
        >
        <button 
          class="primary-btn-sm" 
          (click)="postComment()" 
          [disabled]="isPosting || !(newComment || '').trim()">
          <mat-icon>{{ isPosting ? 'hourglass_empty' : 'send' }}</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Same styles as before, kept exactly identical for design consistency */
    .dialog-wrapper { background-color: #121827; color: #ffffff; font-family: 'Inter', sans-serif; border-radius: 16px; display: flex; flex-direction: column; height: 600px; max-height: 85vh; overflow: hidden; }
    .dialog-title { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 18px; font-weight: 600; background: #0f1423; }
    .icon-btn { background: transparent; border: none; color: #9ca3af; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { color: white; }
    
    .comments-list { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
    .comments-list::-webkit-scrollbar { width: 6px; }
    .comments-list::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
    .empty-comments { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; }
    
    .activity-item { display: flex; gap: 12px; }
    .avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: white; flex-shrink: 0;}
    .activity-content { flex: 1; }
    .comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .comment-header strong { font-size: 13px; color: #e5e7eb; }
    .time { font-size: 11px; color: #6b7280; }
    .comment-bubble { background: #1f2937; padding: 12px 16px; border-radius: 0 12px 12px 12px; font-size: 14px; color: #d1d5db; line-height: 1.5; border: 1px solid rgba(255,255,255,0.05);}
    
    .comment-box { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 12px; background: #0f1423; }
    .comment-box input { flex: 1; background: #050505; border: 1px solid #374151; color: white; border-radius: 8px; padding: 12px 16px; font-size: 14px; outline: none; transition: 0.2s; }
    .comment-box input:focus { border-color: #6366f1; }
    .comment-box input:disabled { opacity: 0.5; cursor: not-allowed; }
    .primary-btn-sm { background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%); color: white; border: none; border-radius: 8px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
    .primary-btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class CommentsDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // Memory leak prevention

  task: Task;
  users: User[] = [];
  comments: TaskComment[] = [];
  
  newComment: string = '';
  isPosting: boolean = false; // Prevent double submission

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { task: Task, users: User[] },
    private dialogRef: MatDialogRef<CommentsDialogComponent>,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {
    this.task = data.task;
    this.users = data.users || [];
  }

  ngOnInit() { 
    this.loadComments(); 
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadComments() {
    this.taskService.getComments(this.task.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: TaskComment[]) => {
          this.comments = res || [];
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Failed to load comments', err)
								
      });
  }

  postComment() {
    const text = (this.newComment || '').trim();
    if (!text || this.isPosting) return;

    this.isPosting = true; // Block UI temporarily
    
    this.taskService.addComment(this.task.id, text)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.newComment = '';
          this.isPosting = false;
          this.loadComments();
        },
        error: () => {
          this.isPosting = false;
          console.error('Failed to post comment');
        }
      });
  }

  getUserName(userId: string): string {
    const u = this.users.find(x => x.id === userId);
	
								  
    if (!u) return 'Unknown User';
    
    // Strict fallback chain
    return u.first_name || u.last_name || u.username || u.email || 'Unknown User';
  }
  
  getAvatar(userId: string): string {
    const name = this.getUserName(userId);
	
													
    if (!name || name === 'Unknown User') {
      return '??';
    }
	
    return name.substring(0, 2).toUpperCase();
  }

  close() { 
    this.dialogRef.close(); 
  }
}



// import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
// import { MatIconModule } from '@angular/material/icon';
// import { TaskService } from '../../services/task.service';

// @Component({
//   selector: 'app-comments-dialog',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
//   template: `
//     <div class="dialog-wrapper">
//       <div class="dialog-title">
//         <div style="display: flex; align-items: center; gap: 10px;">
//           <mat-icon style="color: #a855f7;">forum</mat-icon> 
//           Comments: {{task.id | slice:0:8}}
//         </div>
//         <button class="icon-btn" (click)="close()"><mat-icon>close</mat-icon></button>
//       </div>

//       <div class="dialog-content comments-list">
//         <div *ngIf="comments.length === 0" class="empty-comments">
//           No comments yet. Start the conversation!
//         </div>

//         <div class="activity-item" *ngFor="let c of comments">
//           <div class="avatar-sm">{{ getAvatar(c.user_id) }}</div>
//           <div class="activity-content">
//             <div class="comment-header">
//               <strong>{{ getUserName(c.user_id) }}</strong>
//               <span class="time">{{ c.created_at | date:'short' }}</span>
//             </div>
//             <div class="comment-bubble">{{ c.comment_text || c.text }}</div>
//           </div>
//         </div>
//       </div>

//       <div class="comment-box">
//         <input type="text" placeholder="Write a comment..." [(ngModel)]="newComment" (keyup.enter)="postComment()">
//         <!-- SAFELY check if newComment exists before trimming -->
//         <button class="primary-btn-sm" (click)="postComment()" [disabled]="!(newComment || '').trim()">
//           <mat-icon>send</mat-icon>
//         </button>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .dialog-wrapper { background-color: #121827; color: #ffffff; font-family: 'Inter', sans-serif; border-radius: 16px; display: flex; flex-direction: column; height: 600px; max-height: 85vh; overflow: hidden; }
//     .dialog-title { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 18px; font-weight: 600; background: #0f1423; }
//     .icon-btn { background: transparent; border: none; color: #9ca3af; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
//     .icon-btn:hover { color: white; }
    
//     .comments-list { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
//     .comments-list::-webkit-scrollbar { width: 6px; }
//     .comments-list::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
//     .empty-comments { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; }
    
//     .activity-item { display: flex; gap: 12px; }
//     .avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: white; flex-shrink: 0;}
//     .activity-content { flex: 1; }
//     .comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
//     .comment-header strong { font-size: 13px; color: #e5e7eb; }
//     .time { font-size: 11px; color: #6b7280; }
//     .comment-bubble { background: #1f2937; padding: 12px 16px; border-radius: 0 12px 12px 12px; font-size: 14px; color: #d1d5db; line-height: 1.5; border: 1px solid rgba(255,255,255,0.05);}
    
//     .comment-box { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 12px; background: #0f1423; }
//     .comment-box input { flex: 1; background: #050505; border: 1px solid #374151; color: white; border-radius: 8px; padding: 12px 16px; font-size: 14px; outline: none; transition: 0.2s; }
//     .comment-box input:focus { border-color: #6366f1; }
//     .primary-btn-sm { background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%); color: white; border: none; border-radius: 8px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
//     .primary-btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }
//   `]
// })
// export class CommentsDialogComponent implements OnInit {
//   task: any;
//     users: any[] = [];
//   comments: any[] = [];
//   newComment: string = '';

//   constructor(
//     @Inject(MAT_DIALOG_DATA) public data: any,
//     private dialogRef: MatDialogRef<CommentsDialogComponent>,
//     private taskService: TaskService,
//     private cdr: ChangeDetectorRef // <--- INJECTED THIS TO FIX NG0100
//   ) {
//     this.task = data.task;
//     this.users = data.users || [];
//   }

//   ngOnInit() { 
//     this.loadComments(); 
//   }

//   loadComments() {
//     this.taskService.getComments(this.task.id).subscribe((res: any[]) => {
//       this.comments = res || [];
//       console.log('All Users:', this.users);
//     console.log('Fetched Comments:', this.comments);
//       this.cdr.detectChanges(); 
//     });
//   }

//   postComment() {
//     if (!(this.newComment || '').trim()) return;
//     this.taskService.addComment(this.task.id, this.newComment).subscribe(() => {
//       this.newComment = '';
//       this.loadComments();
//     });
//   }

//  getUserName(userId: string) {
//     const u = this.users.find(x => x.id === userId);
    
//     // If user is not found at all
//     if (!u) return 'Unknown User';
    
//     // If user is found, try to get their name. If all are null, use their email, or default to Unknown
//     return u.first_name || u.name || u.username || u.email || 'Unknown User';
//   }
  
//   getAvatar(userId: string) {
//     const name = this.getUserName(userId);
    
//     // Safety check to prevent the .substring crash!
//     if (!name || name === 'Unknown User') {
//       return '??';
//     }
    
//     return name.substring(0, 2).toUpperCase();
//   }

//   close() { 
//     this.dialogRef.close(); 
//   }
// }