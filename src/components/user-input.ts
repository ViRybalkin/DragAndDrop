/// <reference path="base-component.ts"/>
/// <reference path="../state/project-state.ts"/>

namespace App {
  export class UserInput extends Component<HTMLDivElement, HTMLFormElement>{
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
}
