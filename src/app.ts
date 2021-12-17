enum ProjectStatus {
  active,
  finished,
}

class Project{
  constructor(
    public id:string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

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
     this.projects.push(newProject)
     for (const listenerFn of this.listeners) {
       listenerFn(this.projects.slice())
     }
   }
}

const projectState = ProjectsState.getInstance()

interface Validateble {
  value: string | number;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number;
  min?: number;
}

function autoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this)
    }
  }
  return adjDescriptor
}

function validate(validate: Validateble) {
  let isValid = true;
  if (validate.required) {
    isValid = isValid && validate.value.toString().trim().length !== 0
  }
  if (validate.minLength && validate.value != null && typeof validate.value === 'string') {
    isValid = isValid && validate.value.length >= validate.minLength
  }
  if (validate.maxLength && validate.value != null && typeof validate.value === 'string') {
    isValid = isValid && validate.value.length <= validate.maxLength
  }
  if (validate.min && validate.value != null && typeof validate.value === 'number') {
    isValid = isValid && validate.value > validate.min
  }
  if (validate.max && validate.value != null && typeof validate.value === 'number') {
    isValid = isValid && validate.value < validate.max
  }
  return isValid
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(templateId: string, hostElement: string, insertAtStart: boolean, newElementID?: string,) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElement)! as T;

    const importNode = document.importNode(this.templateElement.content, true);
    this.element = importNode.firstElementChild as U;
    if(newElementID) {
    this.element.id = newElementID
    }

    this.attach(insertAtStart)
  }
  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend',this.element)
  }

  abstract configure?(): void;
  abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement,HTMLLIElement>{
  private project: Project;

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false,project.id);
    this.project = project
    this.configure()
    this.renderContent()
  }

  configure(){}
  renderContent(){
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.project.people.toString();
    this.element.querySelector('h3')!.textContent = this.project.description;

  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement>{
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
  super('project-list', 'app',false, `${type}-projects`);
    this.assignedProjects = []

    this.configure()
    this.renderContent()
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(prj =>{
        if(this.type === 'active') {
          return prj.status === ProjectStatus.active
        }
        return prj.status === ProjectStatus.finished
      })
      this.assignedProjects = relevantProjects;
      this.renderProjects()
    })
  }


   renderContent(){
    const listId = `${this.type}-projects-list`
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
  }

   renderProjects(){
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id,prjItem)
    }
  }
}

class Template extends Component<HTMLDivElement, HTMLFormElement>{
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true,'user-input')
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure()
  }
  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent(){

  }

    getUserInfo(): [string,string,number] | void {
    const eneterdTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const validateTitle: Validateble = {
      value: eneterdTitle,
      required: true,
      minLength: 5,
    };
    const validateDescription: Validateble = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    }
    const validatePeople: Validateble = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    }

    if(!validate(validateTitle) ||
      !validate(validateDescription) ||
      !validate(validatePeople)) {
      alert('Invalid input')
      return
    } else {
      return [eneterdTitle,enteredDescription,+enteredPeople]
    }
  }

  private clearInput() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

    @autoBind
    private submitHandler (e: Event) {
      e.preventDefault();
      const userInput = this.getUserInfo()
      if (Array.isArray(userInput)) {
        const [title,desc,people] = userInput;
        projectState.addProject(title,desc,people)
        this.clearInput()
      }
    }

}

const project = new Template();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');

