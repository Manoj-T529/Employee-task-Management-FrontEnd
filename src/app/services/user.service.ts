import { Injectable } from '@angular/core';
import { ApiService } from './api.services';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(private api: ApiService) {}

  searchEmployees(search: string, page: number, size: number): Observable<any> {
    return this.api.get('/users', {
      role: 'employee',
      search,
      page,
      size
    });
  }
}
