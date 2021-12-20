namespace App {
  type Listener<T> = (items: T[]) => void

  class State<T> {
    protected  listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
      this.listeners.push(listenerFn)
    }
  }

  class ProjectsState extends  State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectsState;

    private constructor() {
      super()
    }

    static getInstance(){
      if(this.instance){
        return this.instance
      }
      this.instance = new ProjectsState()
      return this.instance
    }

    addProject(title: string, description: string, nomOfPeople: number) {
      const newProject = new Project(Math.random().toString(),title,description,nomOfPeople,ProjectStatus.active)
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice())
      }
      this.projects.push(newProject)
      this.updateListeners()
    }
    moveProject(projectId: string, newStatus: ProjectStatus) {
      const project = this.projects.find(prj => prj.id === projectId)
      if(project && project.status !== newStatus) {
        project.status = newStatus;
        this.updateListeners()
      }
    }
    private updateListeners() {
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice())
      }
    }
  }

  export const projectState = ProjectsState.getInstance()

}
