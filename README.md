# low
> a templating driven low-code framework for rapid application developmnet

**Proper readme coming soon... All of this is a work in progress**

## About
`low` is a framework for building systems without having to do too much programming. It's aim isn't to be an _App Builder&trade;_ that require zero development experience, often systems that claim to be that have to make compromises and suffer as a result. Here are the goals:

* **Configuration driven** - everything is stored as a big JSON blob (don't worry, it comes with tools to manage this and some day a UI!)
* **Task driven** - all functions and bits of work are broken down into simple tasks that are executed by single purpose modules called `Doers`
* **Templateable** - any bit of a task's configuration can be represented by a template which is compiled given an execution context
* **Modular** - everything is modules! We will provide a number of common modules that can be dropped into an system and you can very easily write your own using Typescript
* **Cachable** - outputs for each task and templated bits of task configurations can be cached given whatever parameters from the current context you want
* **Reusable** - there might be certain common tasks that are interacted with in a number of ways (web applications, task queue processors, system messages) and you might want to re-use them no matter the source of execution
* **Scalable and portable** - have as many nodes running your system as you like

## Key concepts
There are a few concepts to help you get your head around how all of this works. The `Environment`, `TaskConfiguration`, `ObjectCompiler`, and the 5 types of `Module`. Each are explained below.

### The `Environment`
This is the base of the entire `low` system. An instance of this is created and loaded with all of your task configurations and modules. It does little other than initialise everything and act as your programs reference to the `low` system.

### The `TaskConfiguration`
Every program, job, website route, or whatever can be broken down into a simple task. Think of it as a function call. Take a web request for a not so simple search results page for instance, the entire arc can be broken down as follows:

1. [Auth provider] Check if the user is authenticated
2. [Database query] If they are authenticated get their user profile
3. [Search index query] Construct and execute a search query based on querystring parameters and user preferences (if they exist)
4. [Database query] Store constructed query in a users profile
5. [Renderer] Use a templating language to render the results to send back to the user

In `low` each of these steps can be represented as a simple configuration and grouped together using a special task type that executes tasks serially. Each of these tasks requires a bit of dynamic input based on the incoming HTTP request and results from previous tasks in the chain. That is where the `ObjectCompiler` comes in.

### The `ObjectCompiler`
There are certain bits of JSON - such as your task configurations - which may need to change depending on what is being run.
