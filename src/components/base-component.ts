namespace App {

export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
}
