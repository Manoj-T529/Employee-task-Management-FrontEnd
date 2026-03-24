import { Injectable } from '@angular/core';
import { ApiService } from './api.services';
import { Observable, map } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {

 constructor(private api: ApiService) {}

 getProjects(): Observable<any[]> {
  return this.api.get('/projects').pipe(
    map((res: any) => {
      const payload = res.data;
      return Array.isArray(payload) ? payload : (payload?.data || []);
    })
  );
 }

 createProject(data: any) {
  return this.api.post('/projects', data);
 }

 deleteProject(id: string) { return this.api.delete('/projects/' + id); }
}


// import { Injectable } from '@angular/core';
// import { ApiService } from './api.services';
// import { Observable } from 'rxjs';
// import { Project } from '../models/project.model';

// @Injectable({ providedIn: 'root' })
// export class ProjectService {

//  constructor(private api: ApiService) {}

//  getProjects(): Observable<Project[]> {
//   return this.api.get('/projects');
//  }

//  createProject(data: any) {
//   return this.api.post('/projects', data);
//  }

// }