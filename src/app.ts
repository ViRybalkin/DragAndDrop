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
      const boundFn = originalMethod.bind(this)
      return boundFn
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

class Template {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    const importNode = document.importNode(this.templateElement.content, true);
    this.element = importNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input'

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure()
    this.attach()
  }
    private attach() {
      this.hostElement.insertAdjacentElement('afterbegin',this.element)
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
        console.log(title,desc,people)
        this.clearInput()
      }
    }

    private configure() {
    this.element.addEventListener('submit', this.submitHandler);
    }
}

const project = new Template()
