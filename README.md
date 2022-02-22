# Commander JS (Decorated)
*"What good is a true Commander if they're not decorated?" \*ba dum tss!\**

## Installation
```
npm install commander.js-decorated
```

## Command Groups
Command Groups can be used to containerize a group of commands.
Let's start by creating a simple CommandGroup.

```
import { CommandGroup, Command } from 'commander.js-decorated';
import { program }               from 'commander.js';


// If no name is specified, it'll convert the class name to kebab case and uses that
@CommandGroup(name?: string)
class Bucket {

	// If no name is specified, it'll convert the method name to kebab case and uses that
	@Command(name?: string)
	add() {
		console.log('Added!');
	}

	@Command()
	remove() {
		console.log('Removed!');
	}
}


// Now (Bucket as any).toCommand(); will give you a commander.js Command that you can add to your existing commander.js setup.
program.add((Bucket as any).toCommand());

```

## Options
Option flags can be added with a decorator to each command:

```
import { CommandGroup, Command, Option } from 'commander.js-decorated';
import { program }                       from 'commander.js';

@CommandGroup()
class Bucket {

	@Command()
	@Option('--env', 'name of the environment')
	@Option('--foo [value]', 'some description', { validValues : [ 'bar', 'lorem' ] })
	add({ env, foo } = {}) {
		console.log('Added with env as: ' + env);
	}

	@Command()
	remove() {
		console.log('Removed!');
	}
}
```

## Arguments
Arguments follow the same syntax as commander.js Argument. 

```
import { CommandGroup, Command, Option } from 'commander.js-decorated';
import { program }                       from 'commander.js';

@CommandGroup()
class Bucket {
	@Command()
	@Option('--verbose')
	@Argument('[arg2...]', 'description')
	@Argument('<arg1>', 'description', { validValues : [ 'foo', 'bar' ] })
	add() {
		console.log('Removed!');
	}
}
```

*Note that decorators are ordered from bottom -> top meaning the lower @Argument will be added first then the upper @Argument.*

## Roadmap
1) **Nested CommandGroups**: We're currently exploring different patterns and trying to determine the best solution with least amount of maintenance.
2) **Custom Help Command**


## Contributions
All proposals are welcome!

## License
                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.



