import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.services';
import { User } from '../models/user.model';
import { CreateUserDto } from '../models/create-user.dto';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private readonly basePath = '/admin/users';

  constructor(private api: ApiService) {}

  
  getEmployees(params?: Record<string, any>): Observable<User[]> {
    return this.api.get(this.basePath, params) as Observable<User[]>;
  }

  
  createEmployee(data: CreateUserDto): Observable<User> {
  return this.api.post<User>(this.basePath, data);
    }

  updateEmployee(id: number, data: Partial<User>): Observable<User> {
    return this.api.put(`${this.basePath}/${id}`, data) as Observable<User>;
  }

  
  deleteEmployee(id: number): Observable<void> {
  return this.api.delete<void>(`${this.basePath}/${id}`);
}

}
