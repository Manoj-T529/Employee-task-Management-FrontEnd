import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../services/api.services';
import { User } from '../models/user.model';
import { CreateUserDto } from '../models/create-user.dto';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  private readonly basePath = '/users';

  constructor(private api: ApiService) {}

   getAllUsers(): Observable<any> {
    // Make sure this matches your actual API route!
    return this.api.get(`${this.basePath}`); 
  }
  
   getEmployees(): Observable<any[]> {
    return this.api.get(`${this.basePath}/employees`).pipe(
      map((res: any) => {
        // Safely extract the array whether it's wrapped in 'data' or 'data.data'
        const payload = res.data;
        return Array.isArray(payload) ? payload : (payload?.data || []);
      })
    );
  }

  createEmployee(data: any): Observable<any> {
    const payload = { ...data, role: 'EMPLOYEE' };
    return this.api.post<any>(this.basePath, payload);
  }

  updateEmployee(id: number, data: Partial<User>): Observable<User> {
    return this.api.put(`${this.basePath}/${id}`, data) as Observable<User>;
  }

  
  deleteEmployee(id: number): Observable<void> {
  return this.api.delete<void>(`${this.basePath}/${id}`);
}

 getGlobalActivity() {
    return this.api.get(`${this.basePath}/audit`); // Ensure this matches your backend route
  }

}


