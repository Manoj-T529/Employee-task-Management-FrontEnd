// import { Injectable } from '@angular/core';
// import { ApiService } from './api.services';
// import { Observable } from 'rxjs';
// import { User } from '../models/user.model';

// @Injectable({ providedIn: 'root' })
// export class UserService {

//   constructor(private api: ApiService) {}

//   searchEmployees(search: string, page: number, size: number): Observable<any> {
//     return this.api.get('/users', {
//       role: 'employee',
//       search,
//       page,
//       size
//     });
//   }
// }


import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.services';
import { User } from '../models/user.model';
import { CreateUserDto } from '../models/create-user.dto';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private readonly basePath = '/users';

  constructor(private api: ApiService) {}

  getEmployees(): Observable<User[]> {
    return this.api.get(`${this.basePath}/employees`).pipe(
      map((res: any) => res.data)
    );
  }

  createEmployee(data: CreateUserDto): Observable<User> {
    // Map your frontend CreateUserDto to what backend expects
    const payload = {
      name: data.name,
      username: data.email.split('@')[0], // Generate a username if backend requires it
      email: data.email,
      password: data.password,
      role: 'EMPLOYEE'
    };
    return this.api.post<any>(this.basePath, payload).pipe(
      map((res: any) => res.data)
    );
  }

  deleteEmployee(id: string): Observable<void> {
    return this.api.delete<any>(`${this.basePath}/${id}`).pipe(
      map((res: any) => res.data)
    );
  }
}
