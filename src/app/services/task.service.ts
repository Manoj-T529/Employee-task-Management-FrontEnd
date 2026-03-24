import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.services';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private api: ApiService) {}

  // Fetch the pre-grouped Kanban board from Redis/DB
  getBoard(projectId: string): Observable<any> {
    return this.api.get(`/tasks/project/${projectId}/board`).pipe(
      map((res: any) => res.data)
    );
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.api.post('/tasks', task).pipe(
      map((res: any) => res.data)
    );
  }

  // Changed to PATCH according to your backend task.routes.js
  updateStatus(id: string, statusId: number): Observable<any> {

    console.log("Status Id ",id, statusId);

    return this.api.patch(`/tasks/${id}/status`, { status_id: statusId }).pipe(
      map((res: any) => res.data)
    );
  }
  
  deleteTask(id: string): Observable<any> {
    return this.api.delete(`/tasks/${id}`).pipe(
      map((res: any) => res.data)
    );
  }

  // Changed to PATCH according to taskController.rescheduleTask
  updateTaskDate(id: string, startDate: string, dueDate: string) {
    return this.api.patch(`/tasks/${id}/schedule`, { start_date: startDate, due_date: dueDate }).pipe(
      map((res: any) => res.data)
    );
  }

  updateTask(id: string, data: any): Observable<any> {

  return this.api.patch(
    `/tasks/${id}`,
    data
  ).pipe(
    map((res: any) => res.data)
  );

}

  getCalendar(start: string, end: string): Observable<Task[]> {
    return this.api.get(`/tasks/calendar?start=${start}&end=${end}`).pipe(
      map((res: any) => res.data)
    );
  }

 
  updateTaskDetails(id: string, data: any): Observable<any> {
    // NOTE: You must create this endpoint in your Node backend!
    return this.api.patch(`/tasks/${id}/details`, data).pipe(
      map((res: any) => res.data)
    );
  }

  // ADD THESE TO task.service.ts
  getComments(taskId: string): Observable<any[]> {
    return this.api.get(`/tasks/${taskId}/comments`).pipe(
      map((res: any) => res.data)
    );
  }

  addComment(taskId: string, text: string): Observable<any> {
    return this.api.post(`/tasks/${taskId}/comments`, { text }).pipe(
      map((res: any) => res.data)
    );
  }
}


// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { ApiService } from './api.services';
// import { Task } from '../models/task.model';
// import { HttpClient } from '@angular/common/http';

// @Injectable({
//   providedIn: 'root'
// })
// export class TaskService {
 

//   constructor(private api: ApiService) {}

//  getTasks(params?: any): Observable<Task[]> {
//     return this.api.get('/tasks', params) as Observable<Task[]>;
//   }

//    createTask(task: Partial<Task>): Observable<Task> {
//     return this.api.post('/tasks', task) as Observable<Task>;
//   }

//   // updateStatus(id: number, status: string): Observable<any> {
//   //   return this.api.put(`/tasks/${id}/status`, { status });
//   // }

//   updateStatus(id: string, statusId: number): Observable<any> {
//   return this.api.put(
//     `/tasks/${id}/status`,
//     { status_id: statusId }
//   );
// }
  
//   deleteTask(id: number): Observable<any> {
//     return this.api.delete(`/tasks/${id}`);
//   }

//   updateTaskDate(
//   id: string,
//   date: string
// ) {

//   return this.api.put(
//     `/tasks/${id}/date`,
//     {
//       due_date: date
//     }
//   );

// }
// }

