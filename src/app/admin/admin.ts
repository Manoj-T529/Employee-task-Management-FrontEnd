// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
// import { Router } from '@angular/router';
// import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
// import { Task } from '../models/task.model';
// import { TaskService } from '../services/task.service';
// import { ProjectService } from '../services/project.service';
// import { UserService } from '../services/user.service';
// import { User } from '../models/user.model';
// import { CreateUserDto } from '../models/create-user.dto';
// import { AdminUserService } from '../services/admin-user.service';
// import { AdminView } from '../models/admin.types';
// import { MaterialModule } from '../shared/material.module';
// import { CalendarComponent } from '../features/calendar/calendar.component';

// // @Component({
// //   selector: 'app-admin',
// //   standalone: true,
// //   imports: [CommonModule, FormsModule, ReactiveFormsModule],
// //   templateUrl: './admin.html',
// //   styleUrls: ['./admin.css']
// // })
// // export class Admin implements OnInit {

// //   tasks: Task[] = [];
// //   employees: User[] = [];
// //   employeesList: User[] = [];
// //   employeeSearchControl = new FormControl('');
// //   selectedEmployee: User | null = null;
// //   isSearchingEmployees = false;
// //   showEmployeeDropdown = false;

// //   page = 0;
// //   size = 10;
// //   isDarkMode = false;

 

// //  currentView: AdminView = 'dashboard';


// //  newTask: {
// //   title: string;
// //   description: string;
// //   assignedTo?: number;
// //   status: 'To Do' | 'In Progress' | 'Completed';
// // } = {
// //   title: '',
// //   description: '',
// //   status: 'To Do'
// // };

// // newEmployee: CreateUserDto = {
// //   name: '',
// //   email: '',
// //   password: ''
// // };

  
// //   constructor(
// //     private taskService: TaskService,
// //     private userService: UserService,
// //     private adminService: AdminUserService,
// //     private router: Router
// //   ) {}

// //   ngOnInit() {
// //     this.loadTasks();
// //     this.loadEmployees();
// //     this.initEmployeeSearch();

// //     const savedTheme = localStorage.getItem('theme');
// //     if (savedTheme === 'light') this.isDarkMode = false;
// //   }

// //   /* ---------------- TASKS ---------------- */

// //   private loadTasks(): void {
// //     this.taskService.getTasks().subscribe({
// //       next: (tasks: Task[]) => this.tasks = tasks,
// //       error: (err) => console.error(err)
// //     });
// //   }

// //  createTask(): void {
// //   if (!this.newTask.title || !this.selectedEmployee) return;

// //   const payload = {
// //     ...this.newTask,
// //     assignedTo: this.selectedEmployee.id
// //   };

// //   this.taskService.createTask(payload).subscribe({
// //     next: () => {
// //       this.resetForm();
// //       this.setView('manage');
// //       this.loadTasks();
// //     }
// //   });
// // }


// //   changeStatus(taskId: number, status: Task['status']) {
// //     this.taskService.updateStatus(taskId, status).subscribe({
// //       next: () => this.loadTasks(),
// //       error: (err) => console.error(err)
// //     });
// //   }


// //   private initEmployeeSearch(): void {
// //     this.employeeSearchControl.valueChanges.pipe(
// //       debounceTime(400),
// //       distinctUntilChanged(),
// //       tap(() => {
// //         this.isSearchingEmployees = true;
// //         this.showEmployeeDropdown = true;
// //       }),
// //       switchMap(value =>
// //         this.userService.searchEmployees(value || '', this.page, this.size)
// //       )
// //     ).subscribe({
// //       next: (res: any) => {
// //         this.employees = res.content || [];
// //         this.isSearchingEmployees = false;
// //       },
// //       error: () => this.isSearchingEmployees = false
// //     });
// //   }

// //   selectEmployee(emp: User): void {
// //     this.selectedEmployee = emp;
// //     this.employeeSearchControl.setValue(emp.name, { emitEvent: false });
// //     this.showEmployeeDropdown = false;
// //   }

// //   clearSelectedEmployee(): void {
// //     this.selectedEmployee = null;
// //     this.employeeSearchControl.setValue('');
// //   }

// //  private resetForm(): void {
// //   this.newTask = {
// //     title: '',
// //     description: '',
// //     status: 'To Do'
// //   };

// //   this.selectedEmployee = null;
// //   this.employeeSearchControl.setValue('');
// // }



// // createEmployee(): void {
// //   if (!this.newEmployee.name || !this.newEmployee.email || !this.newEmployee.password) {
// //     return;
// //   }

// //   this.adminService.createEmployee(this.newEmployee).subscribe({
// //     next: () => {
// //       this.newEmployee = { name: '', email: '', password: '' };
// //       this.loadEmployees();
// //     },
// //     error: (err) => console.error(err)
// //   });
// // }

// // loadEmployees(): void {
// //   this.adminService.getEmployees().subscribe({
// //     next: (res: any) => {
// //       this.employeesList = res.data;   // 👈 important change
// //     },
// //     error: (err) => console.error(err)
// //   });
// // }


// // deleteTask(id: number): void {
// //   if (!confirm('Are you sure you want to delete this task?')) return;

// //   this.taskService.deleteTask(id).subscribe({
// //     next: () => this.loadTasks(),
// //     error: (err) => console.error(err)
// //   });
// // }


// // deleteEmployee(id: number): void {
// //   if (!confirm('Are you sure you want to delete this employee?')) return;

// //   this.adminService.deleteEmployee(id).subscribe({
// //     next: () => this.loadEmployees(),
// //     error: (err) => console.error(err)
// //   });
// // }



// //   /* ---------------- UI ---------------- */

// //   toggleTheme() {
// //     this.isDarkMode = !this.isDarkMode;
// //     document.body.classList.toggle('light-theme', !this.isDarkMode);
// //     localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
// //   }

// //    setView(view: AdminView) {
// //     this.currentView = view;
// //   }

// //   logout() {
// //     localStorage.removeItem('token');
// //     this.router.navigate(['/']);
// //   }

// //   /* ---------------- Dashboard ---------------- */

// //   get totalTasks() { return this.tasks.length; }
// //   get todoCount() { return this.tasks.filter(t => t.status === 'To Do').length; }
// //   get inProgressCount() { return this.tasks.filter(t => t.status === 'In Progress').length; }
// //   get completedCount() { return this.tasks.filter(t => t.status === 'Completed').length; }
// // }


// @Component({
//   selector: 'app-admin',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CalendarComponent],
//   templateUrl: './admin.html',
//   styleUrls: ['./admin.css']
// })
// export class Admin {

// view:any='dashboard'

// projects:any[]=[]
// users:any[]=[]



// task:any={
//  title:'',
//  project_id:'',
//  priority_id:2,
//  assignees:[],
//  due_date:null
// }

// selectedProject:any=null

// board:any={
//  TODO:[],
//  IN_PROGRESS:[],
//  DONE:[]
// }

// employee:any={
//  name:'',
//  email:'',
//  password:''
// }

// newProject:any={
//  name:''
// }

// constructor(
// private taskService:TaskService,
// private projectService:ProjectService,
// private adminService:AdminUserService
// ){}

// ngOnInit(){

// this.loadProjects()
// this.loadUsers()

// }

// setView(v:any){
// this.view=v
// }

// loadProjects(){

// this.projectService
// .getProjects()
// .subscribe(r=>this.projects=r)

// }

// loadBoard(projectId:string){

// this.taskService
// .getTasks(projectId)
// .subscribe((res:any)=>{

//  this.board=res

// })

// }

// openProject(p:any){

// this.selectedProject=p

// this.setView('projectBoard')

// this.loadBoard(p.id)

// }

// loadUsers(){

// // this.adminService
// // .getEmployees()
// // .subscribe(r=>this.users=r.data)

// }

// toggleTheme() {

// document.body.classList.toggle('light-theme')

// }

// createProject(){

// this.projectService
// .createProject(this.newProject)
// .subscribe(()=>this.loadProjects())

// }

// createTask(){

// this.taskService
// .createTask(this.task)
// .subscribe(()=>alert("created"))

// }

// createEmployee(){

// this.adminService
// .createEmployee(this.employee)
// .subscribe(()=>alert("created"))

// }

// }

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MaterialModule } from '../shared/material.module';
// import { CalendarComponent } from '../features/calendar/calendar.component';

// import { TaskService } from '../services/task.service';
// import { ProjectService } from '../services/project.service';
// import { AdminUserService } from '../services/admin-user.service';
// import { AuthService } from '../services/auth.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-admin',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, CalendarComponent],
//   templateUrl: './admin.html',
//   styleUrls: ['./admin.css']
// })
// export class Admin implements OnInit {

//   view: any = 'dashboard';
//   projects: any[] = [];
//   users: any[] = [];

//   task: any = {
//     title: '',
//     project_id: '',
//     priority_id: 2,
//     assignees: [],
//     due_date: null
//   };

//   selectedProject: any = null;
//   board: any = {
//     TODO: [],
//     IN_PROGRESS: [],
//     DONE: []
//   };

//   employee: any = {
//     name: '',
//     email: '',
//     password: ''
//   };

//   newProject: any = { name: '', description: '' };

//   constructor(
//     private taskService: TaskService,
//     private projectService: ProjectService,
//     private adminService: AdminUserService,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.loadProjects();
//     this.loadUsers();
//   }

//   setView(v: any) {
//     this.view = v;
//   }

//   loadProjects() {
//     this.projectService.getProjects().subscribe(r => this.projects = r);
//   }

//   loadBoard(projectId: string) {
//     this.taskService.getBoard(projectId).subscribe((res: any) => {
//       this.board = res;
//     });
//   }

//   openProject(p: any) {
//     this.selectedProject = p;
//     this.setView('projectBoard');
//     this.loadBoard(p.id);
//   }

//   loadUsers() {
//     this.adminService.getEmployees().subscribe(r => this.users = r);
//   }

//   toggleTheme() {
//     document.body.classList.toggle('light-theme');
//   }

//   logout() {
//     this.authService.logout().subscribe(() => {
//       this.router.navigate(['/']);
//     });
//   }

//   createProject() {
//     this.projectService.createProject(this.newProject).subscribe(() => {
//       alert("Project Created");
//       this.newProject = { name: '', description: '' };
//       this.loadProjects();
//     });
//   }

//   createTask() {
//     this.taskService.createTask(this.task).subscribe(() => {
//       alert("Task Created");
//       this.task = { title: '', project_id: '', priority_id: 2, assignees: [], due_date: null };
//     });
//   }

//   createEmployee() {
//     this.adminService.createEmployee(this.employee).subscribe(() => {
//       alert("Employee Created");
//       this.employee = { name: '', email: '', password: '' };
//       this.loadUsers();
//     });
//   }
// }


// import { Component, OnInit } from '@angular/core';

// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// import { DragDropModule } from '@angular/cdk/drag-drop';

// import {
//   CdkDragDrop,
//   moveItemInArray,
//   transferArrayItem
// } from '@angular/cdk/drag-drop';

// import { MaterialModule } from '../shared/material.module';

// import { TaskService } from '../services/task.service';
// import { ProjectService } from '../services/project.service';
// import { AdminUserService } from '../services/admin-user.service';

// import { MatDialog } from '@angular/material/dialog';

// import { TaskDialog } from '../task-dialog/task-dialog';

// @Component({
//   selector: 'app-admin',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     MaterialModule,
//     DragDropModule
//   ],
//   templateUrl: './admin.html',
//   styleUrls: ['./admin.css']
// })
// export class Admin implements OnInit {

//   view = 'dashboard';

//   projects: any[] = [];

//   users: any[] = [];

//   selectedProject: any = null;

//   search = '';

//   filterUser = '';

//   board: any = {
//     TODO: [],
//     IN_PROGRESS: [],
//     DONE: []
//   };

//   constructor(
//     private taskService: TaskService,
//     private projectService: ProjectService,
//     private adminService: AdminUserService,
//     private dialog: MatDialog
//   ) {}

//   ngOnInit() {

//     this.loadProjects();

//     this.loadUsers();

//   }


//   setView(v: any) {

//     this.view = v;

//   }


//   loadProjects() {

//     this.projectService
//       .getProjects()
//       .subscribe(r => this.projects = r);

//   }


//   loadUsers() {

//     this.adminService
//       .getEmployees()
//       .subscribe(r => this.users = r);

//   }


//   openProject(p: any) {

//     this.selectedProject = p;

//     this.view = 'board';

//     this.loadBoard(p.id);

//   }


//   loadBoard(id: string) {

//     this.taskService
//       .getBoard(id)
//       .subscribe((r: any) => {

//         this.board = r;

//       });

//   }

// getStatusId(status: string) {

//   if (status === 'TODO') return 1;

//   if (status === 'IN_PROGRESS') return 2;

//   if (status === 'DONE') return 3;

//   return 1;

// }

//   drop(event: CdkDragDrop<any[]>, status: string) {

//   if (event.previousContainer === event.container) {

//     moveItemInArray(
//       event.container.data,
//       event.previousIndex,
//       event.currentIndex
//     );

//   } else {

//     transferArrayItem(
//       event.previousContainer.data,
//       event.container.data,
//       event.previousIndex,
//       event.currentIndex
//     );

//     const task =
//       event.container.data[event.currentIndex];

//     const statusId =
//       this.getStatusId(status);

//     this.taskService
//       .updateStatus(
//         task.id,
//         statusId
//       )
//       .subscribe();

//   }

// }


//   openTask(task: any) {

//     const ref = this.dialog.open(
//       TaskDialog,
//       {
//         width: '500px',
//         data: {
//           ...task,
//           users: this.users
//         }
//       }
//     );

//     ref.afterClosed().subscribe(r => {

//       if (!r) return;

//       this.taskService
//         .updateTask(r.id, r)
//         .subscribe(() => {

//           this.loadBoard(
//             this.selectedProject.id
//           );

//         });

//     });

//   }


//   getAvatar(id: any) {

//     const u =
//       this.users.find(
//         x => x.id == id
//       );

//     return u ? u.name[0] : '?';

//   }


//   filterTasks(list: any[]) {

//     return list.filter(t => {

//       if (
//         this.search &&
//         !t.title
//           .toLowerCase()
//           .includes(
//             this.search.toLowerCase()
//           )
//       )
//         return false;

//       if (
//         this.filterUser &&
//         !t.assignees?.includes(
//           this.filterUser
//         )
//       )
//         return false;

//       return true;

//     });

//   }

// }


// import { Component, OnInit } from '@angular/core';

// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// import {
//   CdkDragDrop,
//   moveItemInArray,
//   transferArrayItem
// } from '@angular/cdk/drag-drop';

// import { DragDropModule } from '@angular/cdk/drag-drop';

// import { MaterialModule } from '../shared/material.module';

// import { CalendarComponent } from '../features/calendar/calendar.component';

// import { TaskService } from '../services/task.service';
// import { ProjectService } from '../services/project.service';
// import { AdminUserService } from '../services/admin-user.service';
// import { AuthService } from '../services/auth.service';

// import { Router } from '@angular/router';

// import { MatDialog } from '@angular/material/dialog';

// import { TaskDialog } from '../task-dialog/task-dialog';

// @Component({
//   selector: 'app-admin',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     MaterialModule,
//     CalendarComponent,
//     DragDropModule
//   ],
//   templateUrl: './admin.html',
//   styleUrls: ['./admin.css']
// })
// export class Admin implements OnInit {

//   view: any = 'dashboard';

//   projects: any[] = [];

//   users: any[] = [];

//   selectedProject: any = null;

//   search = '';

//   filterUser = '';

//   board: any = {
//     TODO: [],
//     IN_PROGRESS: [],
//     DONE: []
//   };

//   task: any = {
//     title: '',
//     project_id: '',
//     priority_id: 2,
//     assignees: [],
//     due_date: null
//   };

//   employee: any = {
//     name: '',
//     email: '',
//     password: ''
//   };

//   newProject: any = {
//     name: '',
//     description: ''
//   };

//   constructor(
//     private taskService: TaskService,
//     private projectService: ProjectService,
//     private adminService: AdminUserService,
//     private authService: AuthService,
//     private router: Router,
//     private dialog: MatDialog
//   ) {}

//   ngOnInit() {

//     this.loadProjects();

//     this.loadUsers();

//   }


//   setView(v: any) {

//     this.view = v;

//   }


//   toggleTheme() {

//     document.body.classList.toggle('light-theme');

//   }


//   loadProjects() {

//     this.projectService
//       .getProjects()
//       .subscribe(r => this.projects = r);

//   }


//   loadUsers() {

//     this.adminService
//       .getEmployees()
//       .subscribe(r => this.users = r);

//   }


//   openProject(p: any) {

//     this.selectedProject = p;

//     this.view = 'board';

//     this.loadBoard(p.id);

//   }


//   loadBoard(id: string) {

//     this.taskService
//       .getBoard(id)
//       .subscribe(r => this.board = r);

//   }


//   getStatusId(s: string) {

//     if (s === 'TODO') return 1;
//     if (s === 'IN_PROGRESS') return 2;
//     if (s === 'DONE') return 3;

//     return 1;

//   }


//   drop(event: CdkDragDrop<any[]>, status: string) {

//     if (event.previousContainer === event.container) {

//       moveItemInArray(
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       );

//     } else {

//       transferArrayItem(
//         event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       );

//       const task =
//         event.container.data[event.currentIndex];

//       const statusId =
//         this.getStatusId(status);

//       this.taskService
//         .updateStatus(
//           task.id,
//           statusId
//         )
//         .subscribe();

//     }

//   }


//   openTaskDialog(task: any) {

//     const ref = this.dialog.open(
//       TaskDialog,
//       {
//         width: '500px',
//         data: {
//           ...task,
//           users: this.users
//         }
//       }
//     );

//     ref.afterClosed().subscribe(r => {

//       if (!r) return;

//       this.taskService
//         .updateTask(r.id, r)
//         .subscribe(() => {

//           this.loadBoard(
//             this.selectedProject.id
//           );

//         });

//     });

//   }


//   getAvatar(id: any) {

//     const u =
//       this.users.find(
//         x => x.id == id
//       );

//     return u ? u.name[0] : '?';

//   }


//   filterTasks(list: any[]) {

//     return list.filter(t => {

//       if (
//         this.search &&
//         !t.title
//           .toLowerCase()
//           .includes(
//             this.search.toLowerCase()
//           )
//       )
//         return false;

//       if (
//         this.filterUser &&
//         !t.assignees?.includes(
//           this.filterUser
//         )
//       )
//         return false;

//       return true;

//     });

//   }


//   createProject() {

//     this.projectService
//       .createProject(this.newProject)
//       .subscribe(() => {

//         this.newProject = {
//           name: '',
//           description: ''
//         };

//         this.loadProjects();

//       });

//   }


//   createTask() {

//     this.taskService
//       .createTask(this.task)
//       .subscribe(() => {

//         this.task = {
//           title: '',
//           project_id: '',
//           priority_id: 2,
//           assignees: [],
//           due_date: null
//         };

//       });

//   }


//   createEmployee() {

//     this.adminService
//       .createEmployee(this.employee)
//       .subscribe(() => {

//         this.employee = {
//           name: '',
//           email: '',
//           password: ''
//         };

//         this.loadUsers();

//       });

//   }


//   logout() {

//     this.authService.logout().subscribe(() => {

//       this.router.navigate(['/']);

//     });

//   }

// }

// import { Component, OnInit } from '@angular/core';

// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// import {
//   CdkDragDrop,
//   moveItemInArray,
//   transferArrayItem
// } from '@angular/cdk/drag-drop';

// import { DragDropModule } from '@angular/cdk/drag-drop';

// import { MaterialModule } from '../shared/material.module';

// import { CalendarComponent } from '../features/calendar/calendar.component';

// import { TaskService } from '../services/task.service';
// import { ProjectService } from '../services/project.service';
// import { AdminUserService } from '../services/admin-user.service';

// import { MatDialog } from '@angular/material/dialog';
// import { TaskDialog } from '../task-dialog/task-dialog';

// @Component({
//   selector: 'app-admin',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     MaterialModule,
//     CalendarComponent,
//     DragDropModule
//   ],
//   templateUrl: './admin.html',
//   styleUrls: ['./admin.css']
// })
// export class Admin implements OnInit {

//   view:any = 'dashboard'

//   projects:any[]=[]
//   users:any[]=[]

//   selectedProject:any=null
//   selectedProjectId:any=null

//   search=''
//   filterUser=''

//   board:any={
//     TODO:[],
//     IN_PROGRESS:[],
//     DONE:[]
//   }

//   task:any={
//     title:'',
//     project_id:'',
//     priority_id:2,
//     assignees:[],
//     due_date:null
//   }

//   employee:any={
//     name:'',
//     email:'',
//     password:''
//   }

//   newProject:any={
//     name:'',
//     description:''
//   }


//   constructor(
//     private taskService:TaskService,
//     private projectService:ProjectService,
//     private adminService:AdminUserService,
//     private dialog:MatDialog
//   ){}

//   ngOnInit(){

//     this.loadProjects()
//     this.loadUsers()

//   }


//   setView(v:any){

//     this.view=v

//   }


//   loadProjects(){

//     this.projectService
//     .getProjects()
//     .subscribe(r=>this.projects=r)

//   }


//   loadUsers(){

//     this.adminService
//     .getEmployees()
//     .subscribe(r=>this.users=r)

//   }


//   changeProject(){

//     if(!this.selectedProjectId) return

//     this.openProject({
//       id:this.selectedProjectId
//     })

//   }


//   openProject(p:any){

//     this.selectedProject=p

//     this.view='board'

//     this.loadBoard(p.id)

//   }


//   loadBoard(id:string){

//     this.taskService
//     .getBoard(id)
//     .subscribe(r=>this.board=r)

//   }


//   getStatusId(s:string){

//     if(s==='TODO') return 1
//     if(s==='IN_PROGRESS') return 2
//     if(s==='DONE') return 3

//     return 1

//   }


//   drop(event:CdkDragDrop<any[]>,status:string){

//     if(event.previousContainer===event.container){

//       moveItemInArray(
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       )

//     }else{

//       transferArrayItem(
//         event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       )

//       const task=
//       event.container.data[event.currentIndex]

//       const statusId=
//       this.getStatusId(status)

//       this.taskService
//       .updateStatus(task.id,statusId)
//       .subscribe()

//     }

//   }


//   openTaskDialog(task:any){

//     const ref=this.dialog.open(
//       TaskDialog,
//       {
//         width:'500px',
//         data:{
//           ...task,
//           users:this.users
//         }
//       }
//     )

//     ref.afterClosed()
//     .subscribe(r=>{

//       if(!r) return

//       this.taskService
//       .updateTask(r.id,r)
//       .subscribe(()=>{
//         this.loadBoard(
//           this.selectedProject.id
//         )
//       })

//     })

//   }


//   getAvatar(id:any){

//     const u=
//     this.users.find(
//       x=>x.id==id
//     )

//     return u ? u.name[0] : '?'

//   }


//   filterTasks(list:any[]){

//     return list.filter(t=>{

//       if(
//         this.search &&
//         !t.title
//         .toLowerCase()
//         .includes(
//           this.search.toLowerCase()
//         )
//       ) return false

//       if(
//         this.filterUser &&
//         !t.assignees?.includes(
//           this.filterUser
//         )
//       ) return false

//       return true

//     })

//   }


//   createProject(){

//     this.projectService
//     .createProject(this.newProject)
//     .subscribe(()=>{

//       this.newProject={
//         name:'',
//         description:''
//       }

//       this.loadProjects()

//     })

//   }


//   createTask(){

//     this.taskService
//     .createTask(this.task)
//     .subscribe(()=>{

//       this.task={
//         title:'',
//         project_id:'',
//         priority_id:2,
//         assignees:[],
//         due_date:null
//       }

//     })

//   }


//   createEmployee(){

//     this.adminService
//     .createEmployee(this.employee)
//     .subscribe(()=>{

//       this.employee={
//         name:'',
//         email:'',
//         password:''
//       }

//       this.loadUsers()

//     })

//   }

// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { MaterialModule } from '../shared/material.module';
import { CalendarComponent } from '../features/calendar/calendar.component';
import { TaskService } from '../services/task.service';
import { ProjectService } from '../services/project.service';
import { AdminUserService } from '../services/admin-user.service';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from '../features/tasks/task-dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../shared/ui/toast.service';
import { CommentsDialogComponent } from '../features/tasks/comments-dialog.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MaterialModule,
    CalendarComponent, DragDropModule
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {
  view: string = 'dashboard';
  projects: any[] = [];
  users: any[] = [];
   allUsers: any[] =[];

  selectedProject: any = null;
  selectedProjectId: string = '';
  isLoadingProjects: boolean = true;
  isLoadingBoard: boolean = false;

  board: any = { TODO: [], IN_PROGRESS: [], DONE: [] };

   task: any = { 
    title: '', description: '', project_id: '', priority_id: 2, 
    story_points: null, start_date: null, due_date: null, assignees: [] 
  };
  employee: any = { 
    first_name: '', last_name: '', username: '', 
    email: '', password: '', role: 'EMPLOYEE' 
  };

  // API Aligned Project Model
  newProject: any = { 
    name: '', description: '', start_date: null, end_date: null 
  };

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private adminService: AdminUserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadProjects();
    this.loadUsers();
     this.loadAllUsers(); 
  }

  get activeUsers() { return this.users.filter(u => u.status === 'ACTIVE').length; }
  get inactiveUsers() { return this.users.filter(u => u.status !== 'ACTIVE').length; }
  get totalProjects() { return this.projects.length; }

  get todoCount() { return this.board.TODO?.length || 0; }
  get inProgressCount() { return this.board.IN_PROGRESS?.length || 0; }
  get doneCount() { return this.board.DONE?.length || 0; }
  get totalBoardTasks() { return this.todoCount + this.inProgressCount + this.doneCount; }

  // ================= OPEN COMMENTS =================
  openCommentsDialog(event: Event, task: any) {
    event.stopPropagation(); // Stop task edit dialog from opening
    this.dialog.open(CommentsDialogComponent, {
      width: '500px',
      panelClass: 'premium-dialog',
      data: { task: task, users: this.allUsers }
    });
  }

  logout() {
    this.authService.logout().subscribe(() => this.router.navigate(['/']));
  }

  setView(v: string) { this.view = v; }

  // projectService.getProjects() handles pagination mapping {data, meta}
  loadProjects() {
    this.isLoadingProjects = true;
    this.projectService.getProjects().subscribe(r => {
      this.projects = r;
      this.isLoadingProjects = false; // Turn off skeleton
    });
  }

    loadAllUsers() {
    this.adminService.getAllUsers().subscribe((r: any) => {
      // Backend returns { status: "success", data: { data: [...], total: X } } or similar based on pagination
      const dataArray = r.data?.data || r.data || r; 
      
      this.allUsers = Array.isArray(dataArray) 
        ? dataArray.filter((u: any) => !u.email?.includes('_deleted_'))
        :[];
    });
  }
loadUsers() {
    this.adminService.getEmployees().subscribe((r: any) => {
      const dataArray = r.data || r;
      this.users = Array.isArray(dataArray) 
        ? dataArray.filter((u: any) => !u.email?.includes('_deleted_'))
        :[];
    });
  }
 

  // loadUsers() {
  //    this.adminService.getEmployees().subscribe(r => {
  //     // Filter out users that have been soft-deleted
  //     this.users = r.filter((u: any) => !u.email.includes('_deleted_'));
  //   });
  // }

  changeProject() {
    if (!this.selectedProjectId) return;
    const project = this.projects.find(p => p.id === this.selectedProjectId);
    if (project) this.openProject(project);
  }

  openProject(p: any) {
    this.selectedProject = p;
    this.selectedProjectId = p.id;
    this.view = 'board';
    this.loadBoard(p.id);
  }

   loadBoard(id: string) {
    this.isLoadingBoard = true;
    this.taskService.getBoard(id).subscribe((r: any) => {
      this.board = { TODO: r.TODO || [], IN_PROGRESS: r.IN_PROGRESS || [], DONE: r.DONE || [] };
      this.isLoadingBoard = false; // Turn off skeleton
    });
  }

  getStatusId(s: string) {
    if (s === 'TODO') return 1;
    if (s === 'IN_PROGRESS') return 2;
    if (s === 'DONE') return 3;
    return 1;
  }

  drop(event: CdkDragDrop<any[]>, status: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      const task = event.container.data[event.currentIndex];
      const statusId = this.getStatusId(status);
      this.taskService.updateStatus(task.id, statusId).subscribe({
        error: () => this.loadBoard(this.selectedProject.id)
      });
    }
  }

  openTaskDialog(task: any) {
    const ref = this.dialog.open(TaskDialogComponent, {
      width: '560px',
      panelClass: 'premium-dialog',
      data: { ...task, users: this.allUsers } 
    });

    ref.afterClosed().subscribe(updated => {
      if (updated) this.loadBoard(this.selectedProject.id);
    });
  }

  // Uses task_assignees array generated by backend
  getAvatar(userId: string) {
    if (!Array.isArray(this.allUsers)) return '?'; 
    const u = this.allUsers.find(x => x.id === userId);
    if (!u) return '?';
    const name = u.first_name || u.name || u.username || u.email || '?';
    return name.substring(0, 2).toUpperCase();
  }

  createProject() {
  this.projectService.createProject(this.newProject).subscribe(() => {
    this.toast.success('Workspace created successfully!');
    this.newProject = { name: '', description: '' };
    this.loadProjects();
    this.setView('dashboard');
  });
}

  createTask() {
  this.taskService.createTask(this.task).subscribe(() => {
    this.toast.success('Issue created successfully!');
    this.task = { title: '', project_id: '', priority_id: 2, assignees: [], due_date: null };
    if (this.selectedProject) this.loadBoard(this.selectedProject.id);
    this.setView('board');
  });
}

 createEmployee() {
  this.adminService.createEmployee(this.employee).subscribe(() => {
    this.toast.success('Invitation sent to ' + this.employee.email);
    this.employee = { name: '', email: '', password: '' };
    this.loadUsers();
    this.setView('employees');
  });
}

 deleteProject(event: Event, id: string) {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', panelClass: 'premium-dialog',
      data: { title: 'Delete Workspace', message: 'Are you sure you want to permanently delete this workspace and all its tasks? This cannot be undone.' }
    });

    ref.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.projectService.deleteProject(id).subscribe(() => {
          if (this.selectedProjectId === id) { this.selectedProjectId = ''; this.selectedProject = null; this.view = 'dashboard'; }
          this.loadProjects();
        });
      }
    });
  }

  deleteEmployee(id: any) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', panelClass: 'premium-dialog',
      data: { title: 'Remove Teammate', message: 'Are you sure you want to remove this employee from the organization?' }
    });

    ref.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.adminService.deleteEmployee(id).subscribe(() => this.loadUsers());
      }
    });
  }

  deleteTask(event: Event, id: string) {
    event.stopPropagation(); // Prevents opening the edit dialog
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', panelClass: 'premium-dialog',
      data: { title: 'Delete Issue', message: 'Are you sure you want to delete this issue?' }
    });

    ref.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.taskService.deleteTask(id).subscribe(() => this.loadBoard(this.selectedProject.id));
      }
    });
  }
}