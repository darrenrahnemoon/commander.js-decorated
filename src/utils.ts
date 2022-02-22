
import { ensureMetadata } from "./reflect-metadata";

export function mergeClasses(targetClass: Class, ...otherClasses: Class[]) {
	otherClasses.forEach(otherClass => {
		if (targetClass.isPrototypeOf(otherClass) || otherClass.isPrototypeOf(targetClass)) {
			return; // skip since one class is in the prototype chain of the other class so there's no point in mixing it in
		}

		// copy over prototype properties (instance members)
		Object.getOwnPropertyNames(otherClass.prototype).forEach(name => {
			if (!targetClass.prototype.hasOwnProperty(name)) {
				Object.defineProperty(targetClass.prototype, name, Object.getOwnPropertyDescriptor(otherClass.prototype, name));
			}
		});

		// copy over class properties (static members)
		Object.getOwnPropertyNames(otherClass).forEach(name => {
			if (!targetClass.hasOwnProperty(name)) {
				Object.defineProperty(targetClass, name, Object.getOwnPropertyDescriptor(otherClass, name));
			}
		});
	});

	return targetClass;
}

export function Mixin(...mixinClasses: Class[]) {
	return function(targetClass: Class) {
		mergeClasses(targetClass, ...mixinClasses);
		ensureMetadata('class:mixins', [], targetClass).push(...mixinClasses);
	};
}