import _                  from 'lodash';
import { ensureMetadata } from './reflect-metadata';
import { Mixin }          from './utils';

import { Command as CommandOriginal, Argument as ArgumentOriginal, Option as OptionOriginal } from 'commander';

export function CommandGroup(name?: string, description?: string) {
	return function(target) {
		Reflect.defineMetadata('command:group', { name : _.kebabCase(name || target.name), description }, target);
		Mixin(CommandGroupMixin)(target);
	};
}

export function Argument(name: string, description?: string, { defaultValue = undefined, defaultValueDescription = undefined, validValues = [] } = {}) {
	return function(target, propertyKey) {
		const arg = new ArgumentOriginal(name, description);
		if (defaultValue) {
			arg.default(defaultValue, defaultValueDescription);
		}
		if (validValues.length) {
			arg.choices(validValues);
		}
		ensureMetadata('command:arguments', [], target, propertyKey).unshift(arg); // unshift since decorators start in reverse so normal order of arguments in decorators would be reversed
	};
}

export function Option(name: string, description?: string, { defaultValue = undefined, defaultValueDescription = '', validValues = undefined, hideFromHelp = false } = {}) {
	return function(target, propertyKey) {
		const option = new OptionOriginal(name, description);
		if (defaultValue) {
			option.default(defaultValue, defaultValueDescription);
		}
		if (validValues?.length) {
			option.choices(validValues);
		}
		if (hideFromHelp) {
			option.hideHelp(true);
		}
		ensureMetadata('command:options', [], target, propertyKey).push(option);
	};
}

// SHOULD DO: replace with .env() once it comes out https://github.com/tj/commander.js/pull/1587
type NormalizeFunction = (value: string) => any;
export function ENV(variableName: string, normalize?: NormalizeFunction);
export function ENV(variableName: string, mappedTo?: string, normalize?: NormalizeFunction);
export function ENV(variableName: string, mappedToOrNormalize?: string | NormalizeFunction, normalize?: NormalizeFunction) {
	let mappedTo;
	if (typeof mappedToOrNormalize === 'string') {
		mappedTo = mappedToOrNormalize;
	}
	else if (typeof mappedToOrNormalize === 'function') {
		normalize = mappedToOrNormalize;
	}
	if (!mappedTo) {
		mappedTo = _.camelCase(variableName);
	}

	return function(target, propertyKey, descriptor: PropertyDescriptor) {
		const method = descriptor.value;
		descriptor.value = function(...args: [ string, Dictionary<string> ]) {
			const value = process.env[variableName];

			// Adjust the command's handler args if it didn't have any options or arguments
			let options = args[args.length - 2];
			if (typeof options !== 'object' || options instanceof Array) {
				options = {};
				args.push(options);
			}

			// If the environment variable exists and there isn't an explicit option flag with the same name as the environment variable
			if (value !== undefined && options?.[mappedTo] === undefined) {
				options[mappedTo] = normalize ? normalize(value) : value;
			}

			return method.call(this, ...args);
		};

		return descriptor;
	};
}

export function Command(name?: string, description = '') {
	return function(target, propertyKey: string) {
		ensureMetadata('command:commands', {}, target)[propertyKey] = { name : _.kebabCase(name || propertyKey), description };
	};
}

export class CommandGroupMixin {

	private commandCache: CommandOriginal;

	toCommand({ force = false } = {}): CommandOriginal {
		if (!force && this.commandCache) {
			return this.commandCache;
		}

		const groupMetadata: Metadata = Reflect.getMetadata('command:group', this.constructor);
		if (!groupMetadata) {
			throw new Error(`Could not find command group metadata. Did you decorate the '${this.constructor.name}' class with '@CommandGroup()'?`);
		}

		const group = new CommandOriginal(groupMetadata.name);
		group.description(groupMetadata.description);

		const commandsMetadata: Dictionary<Metadata> = Reflect.getMetadata('command:commands', this);
		if (!commandsMetadata) {
			throw new Error(`Could not find any command in command group '${this.constructor.name}'. Did you decorate at least one method with '@Command()'?`);
		}

		_.forEach(commandsMetadata, (metadata, propertyKey) => {
			const command = new CommandOriginal(metadata.name);
			command.description(metadata.description);
			command.action(this[propertyKey].bind(this));

			const options: OptionOriginal[] = Reflect.getMetadata('command:options', this, propertyKey);
			if (options?.length) {
				options.forEach(option => {
					command.addOption(option);
				});
			}

			const args: ArgumentOriginal[] = Reflect.getMetadata('command:arguments', this, propertyKey);
			if (args?.length) {
				args.forEach(arg => {
					command.addArgument(arg);
				});
			}

			group.addCommand(command);
		});

		this.commandCache = group;

		return group;
	}

}

interface Metadata {
	name?: string;
	description?: string;
}
