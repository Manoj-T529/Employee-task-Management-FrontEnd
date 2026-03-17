import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { CreateUserDto } from '../models/create-user.dto';
import { AdminUserService } from '../services/admin-user.service';
import { AdminView } from '../models/admin.types';
import { MaterialModule } from '../shared/material.module';
import { CalendarComponent } from '../features/calendar/calendar.component';

// @Component({
//   selector: 'app-admin',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule],
//   templateUrl: './admin.html',
//   styleUrls: ['./admin.css']
// })
// export class Admin implements OnInit {

//   tasks: Task[] = [];
//   employees: User[] = [];
//   employeesList: User[] = [];
//   employeeSearchControl = new FormControl('');
//   selectedEmployee: User | null = null;
//   isSearchingEmployees = false;
//   showEmployeeDropdown = false;

//   page = 0;
//   size = 10;
//   isDarkMode = false;

 

//  currentView: AdminView = 'dashboard';


//  newTask: {
//   title: string;
//   description: string;
//   assignedTo?: number;
//   status: 'To Do' | 'In Progress' | 'Completed';
// } = {
//   title: '',
//   description: '',
//   status: 'To Do'
// };

// newEmployee: CreateUserDto = {
//   name: '',
//   email: '',
//   password: ''
// };

  
//   constructor(
//     private taskService: TaskService,
//     private userService: UserService,
//     private adminService: AdminUserService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.loadTasks();
//     this.loadEmployees();
//     this.initEmployeeSearch();

//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme === 'light') this.isDarkMode = false;
//   }

//   /* ---------------- TASKS ---------------- */

//   private loadTasks(): void {
//     this.taskService.getTasks().subscribe({
//       next: (tasks: Task[]) => this.tasks = tasks,
//       error: (err) => console.error(err)
//     });
//   }

//  createTask(): void {
//   if (!this.newTask.title || !this.selectedEmployee) return;

//   const payload = {
//     ...this.newTask,
//     assignedTo: this.selectedEmployee.id
//   };

//   this.taskService.createTask(payload).subscribe({
//     next: () => {
//       this.resetForm();
//       this.setView('manage');
//       this.loadTasks();
//     }
//   });
// }


//   changeStatus(taskId: number, status: Task['status']) {
//     this.taskService.updateStatus(taskId, status).subscribe({
//       next: () => this.loadTasks(),
//       error: (err) => console.error(err)
//     });
//   }


//   private initEmployeeSearch(): void {
//     this.employeeSearchControl.valueChanges.pipe(
//       debounceTime(400),
//       distinctUntilChanged(),
//       tap(() => {
//         this.isSearchingEmployees = true;
//         this.showEmployeeDropdown = true;
//       }),
//       switchMap(value =>
//         this.userService.searchEmployees(value || '', this.page, this.size)
//       )
//     ).subscribe({
//       next: (res: any) => {
//         this.employees = res.content || [];
//         this.isSearchingEmployees = false;
//       },
//       error: () => this.isSearchingEmployees = false
//     });
//   }

//   selectEmployee(emp: User): void {
//     this.selectedEmployee = emp;
//     this.employeeSearchControl.setValue(emp.name, { emitEvent: false });
//     this.showEmployeeDropdown = false;
//   }

//   clearSelectedEmployee(): void {
//     this.selectedEmployee = null;
//     this.employeeSearchControl.setValue('');
//   }

//  private resetForm(): void {
//   this.newTask = {
//     title: '',
//     description: '',
//     status: 'To Do'
//   };

//   this.selectedEmployee = null;
//   this.employeeSearchControl.setValue('');
// }



// createEmployee(): void {
//   if (!this.newEmployee.name || !this.newEmployee.email || !this.newEmployee.password) {
//     return;
//   }

//   this.adminService.createEmployee(this.newEmployee).subscribe({
//     next: () => {
//       this.newEmployee = { name: '', email: '', password: '' };
//       this.loadEmployees();
//     },
//     error: (err) => console.error(err)
//   });
// }

// loadEmployees(): void {
//   this.adminService.getEmployees().subscribe({
//     next: (res: any) => {
//       this.employeesList = res.data;   // 👈 important change
//     },
//     error: (err) => console.error(err)
//   });
// }


// deleteTask(id: number): void {
//   if (!confirm('Are you sure you want to delete this task?')) return;

//   this.taskService.deleteTask(id).subscribe({
//     next: () => this.loadTasks(),
//     error: (err) => console.error(err)
//   });
// }


// deleteEmployee(id: number): void {
//   if (!confirm('Are you sure you want to delete this employee?')) return;

//   this.adminService.deleteEmployee(id).subscribe({
//     next: () => this.loadEmployees(),
//     error: (err) => console.error(err)
//   });
// }



//   /* ---------------- UI ---------------- */

//   toggleTheme() {
//     this.isDarkMode = !this.isDarkMode;
//     document.body.classList.toggle('light-theme', !this.isDarkMode);
//     localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
//   }

//    setView(view: AdminView) {
//     this.currentView = view;
//   }

//   logout() {
//     localStorage.removeItem('token');
//     this.router.navigate(['/']);
//   }

//   /* ---------------- Dashboard ---------------- */

//   get totalTasks() { return this.tasks.length; }
//   get todoCount() { return this.tasks.filter(t => t.status === 'To Do').length; }
//   get inProgressCount() { return this.tasks.filter(t => t.status === 'In Progress').length; }
//   get completedCount() { return this.tasks.filter(t => t.status === 'Completed').length; }
// }


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CalendarComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin {

view:any='dashboard'

projects:any[]=[]
users:any[]=[]



task:any={
 title:'',
 project_id:'',
 priority_id:2,
 assignees:[],
 due_date:null
}

selectedProject:any=null

board:any={
 TODO:[],
 IN_PROGRESS:[],
 DONE:[]
}

employee:any={
 name:'',
 email:'',
 password:''
}

newProject:any={
 name:''
}

constructor(
private taskService:TaskService,
private projectService:ProjectService,
private adminService:AdminUserService
){}

ngOnInit(){

this.loadProjects()
this.loadUsers()

}

setView(v:any){
this.view=v
}

loadProjects(){

this.projectService
.getProjects()
.subscribe(r=>this.projects=r)

}

loadBoard(projectId:string){

this.taskService
.getTasks(projectId)
.subscribe((res:any)=>{

 this.board=res

})

}

openProject(p:any){

this.selectedProject=p

this.setView('projectBoard')

this.loadBoard(p.id)

}

loadUsers(){

// this.adminService
// .getEmployees()
// .subscribe(r=>this.users=r.data)

}

toggleTheme() {

document.body.classList.toggle('light-theme')

}

createProject(){

this.projectService
.createProject(this.newProject)
.subscribe(()=>this.loadProjects())

}

createTask(){

this.taskService
.createTask(this.task)
.subscribe(()=>alert("created"))

}

createEmployee(){

this.adminService
.createEmployee(this.employee)
.subscribe(()=>alert("created"))

}

}

