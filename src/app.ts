/// <reference path="models/drag-and-drop.ts" />
/// <reference path="models/project.ts" />
/// <reference path="decorators/autobind.ts"/>
/// <reference path="utils/validator.ts"/>
/// <reference path="components/base-component.ts"/>
/// <reference path="components/user-input.ts"/>
/// <reference path="components/user-list.ts"/>

namespace App{
  new UserInput();
  new ProjectList('active');
  new ProjectList('finished');
}

