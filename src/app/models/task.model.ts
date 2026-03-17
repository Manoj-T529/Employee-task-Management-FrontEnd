// export interface Task {
//   id: number;
//   title: string;
//   description: string;
//   assignedTo: number;
//   status: 'To Do' | 'In Progress' | 'Completed';
// }


export interface Task {

  id: string;

  title: string;

  description?: string;

  project_id: string;

  status_id: number;

  priority_id: number;

  due_date?: string;

  start_date?: string;

  assignees?: string[];

}