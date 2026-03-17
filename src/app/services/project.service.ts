import { Injectable } from '@angular/core';
import { ApiService } from './api.services';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {

 constructor(private api: ApiService) {}

 getProjects(): Observable<Project[]> {
  return this.api.get('/projects');
 }

 createProject(data: any) {
  return this.api.post('/projects', data);
 }

}