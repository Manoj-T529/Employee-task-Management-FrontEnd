export interface User { id: string; first_name?: string; last_name?: string; username?: string; email: string; role: string; status: string; }
export interface Project { id: string; name: string; description?: string; start_date?: string; end_date?: string; }
export interface TaskAssignee { id?: string; user_id: string; task_id?: string; }
export interface Task { id: string; title: string; description?: string; status_id: number; priority_id: number; story_points?: number; start_date?: string; due_date?: string; project_id: string; task_assignees?: TaskAssignee[]; }
export interface Board { TODO: Task[]; IN_PROGRESS: Task[]; DONE: Task[]; }
export interface AuditLog { id: string; entity_type: string; entity_id: string; action: string; old_value: any; new_value: any; performed_by: string; performed_at: string; expanded?: boolean; }
export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment_text?: string;
  text?: string; // Fallback if backend uses 'text'
  created_at: string;
}