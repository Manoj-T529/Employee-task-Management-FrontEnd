import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.services';
import { Task } from '../models/task.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
 

  constructor(private api: ApiService) {}

 getTasks(params?: any): Observable<Task[]> {
    return this.api.get('/tasks', params) as Observable<Task[]>;
  }

   createTask(task: Partial<Task>): Observable<Task> {
    return this.api.post('/tasks', task) as Observable<Task>;
  }

  // updateStatus(id: number, status: string): Observable<any> {
  //   return this.api.put(`/tasks/${id}/status`, { status });
  // }

  updateStatus(id: string, statusId: number): Observable<any> {
  return this.api.put(
    `/tasks/${id}/status`,
    { status_id: statusId }
  );
}
  
  deleteTask(id: number): Observable<any> {
    return this.api.delete(`/tasks/${id}`);
  }

  updateTaskDate(
  id: string,
  date: string
) {

  return this.api.put(
    `/tasks/${id}/date`,
    {
      due_date: date
    }
  );

}
}

