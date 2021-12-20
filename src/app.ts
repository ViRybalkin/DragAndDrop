/// <reference path="drag-and-drop-namespace.ts" />
/// <reference path="project-model-namespace.ts" />

namespace App{

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
    isValid = isValid && validate.value >= validate.min
  }
  if (validate.max && validate.value != null && typeof validate.value === 'number') {
    isValid = isValid && validate.value <= validate.max
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

class ProjectItem extends Component<HTMLUListElement,HTMLLIElement> implements Draggable{
  private project: Project;

  get persons() {
    if(this.project.people === 1) {
      return '1 person'
    }
    return `${this.project.people} persons`
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false,project.id);
    this.project = project
    this.configure()
    this.renderContent()
  }

  @autoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain',this.project.id)
    event.dataTransfer!.effectAllowed = 'move'
  }
  @autoBind
  dragEndHandler(event: DragEvent) {
    console.log(event)
  }

  configure(){
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }
  renderContent(){
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.description;

  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
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

  @autoBind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData('text/plain')
    projectState.moveProject(prjId,this.type === 'active' ? ProjectStatus.active : ProjectStatus.finished)
  }
  @autoBind
  dragLeaveHandler(_: DragEvent) {
      const listEl = this.element.querySelector('ul')!
      listEl.classList.remove('droppable')

  }
  @autoBind
  dragOverHandler(event: DragEvent) {
    if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault()
      const listEl = this.element.querySelector('ul')!
      listEl.classList.add('droppable')
    }
  }


  renderContent(){
    const listId = `${this.type}-projects-list`
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
  }

   renderProjects(){
    this.element.addEventListener('dragover', this.dragOverHandler)
    this.element.addEventListener('drop', this.dropHandler)
    this.element.addEventListener('dragleave', this.dragLeaveHandler)
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
  new Template();
  new ProjectList('active');
  new ProjectList('finished');
}

