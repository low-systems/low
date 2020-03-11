# Core component types and their inheritance

## `Module`
The base for everything in the system. Has hookable method system that allows Filters to be applied
to input parameters and outputs with priorities.

### Properties
 * `moduleType` - The reflected type of the module,
 * `isReady` - Has the Module been initialised within the environment

### Methods
 * `init` - Used to setup whatever on given configuration data provided by the Environment,
 * `destroy` - Used to tear down a module, cleaning up any data, connections, configurations, etc,
 * `call` - Call a method allowing for filter and cache hooks given a method name, input, and cache configuration

## `Connector` *`implements Module`*
Kinda like services or daemons. These create contexts for executing subroutines and handle I/O

### Methods
 * `runSubroutine` - Creates a context to start running a subroutine,
 * `compileObject` - Allows for task inputs and outputs to be compiled,
 * `execCommand` - Allows for commands to be executed in contexts

## `Doer` *`implements Module`*
Modules that are executed by tasks running in subroutines.

### Properties
 * `schema` - The allowed schema for compiled input data

### Methods
 * `execute` - A hookable method that is called by a Task with compiled input

## `Renderer/Compiler` *`implements Module`*
Used by a Connector`s Object Compiler to render objects for use as input or output

### Methods
 * `compile` - Takes in a context and a template and produces an output

## `CacheManager` *`implements Module`*
Executes cache configurations on `Module.call()` to allow for recalling of cached outputs for `Renderer.compile()` and `Doer.execute()`

### Methods
 * `createCacheKey`,
 * `getItem`,
 * `setItem`,
 * `flushCache`