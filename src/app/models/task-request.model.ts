// export interface CreateTaskRequest {
//   title: string;
//   description: string;
//   assignedTo: number;
//   status: 'To Do' | 'In Progress' | 'Completed';
// }


export interface CreateTaskRequest {

  title: string;

  description?: string;

  project_id: string;

  priority_id: number;

  status_id: number;

  assignees: string[];

  due_date?: string;

}
