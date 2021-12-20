namespace App {
  export interface Validateble {
    value: string | number;
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    max?: number;
    min?: number;
  }

 export function validate(validate: Validateble) {
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
}
