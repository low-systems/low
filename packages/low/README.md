![low logo](resources/logo.png)

# :point_down: low
> a templating driven low-code framework for rapid application developmnet

:construction: **Proper readme coming soon... All of this is a work in progress**

## :information_source: About
`low` is a framework for building systems without having to do too much programming. It's aim isn't to be an _App Builder&trade;_ that require zero development experience, often systems that claim to be that have to make compromises and suffer as a result. Here are the goals:

| | Goal | Description |
| --- | --- | --- |
| :wrench: | **Configuration driven** | everything is stored as a big JSON blob (don't worry, it comes with tools to manage this and some day a UI!) |
| :ballot_box_with_check: | **Task driven** | all functions and bits of work are broken down into simple tasks that are executed by single purpose modules called `Doers` |
| :triangular_ruler: | **Templateable** | any bit of a task's configuration can be represented by a template which is compiled given an execution context |
| :symbols: | **Modular** | everything is modules! We will provide a number of common modules that can be dropped into an system and you can very easily write your own using Typescript |
| :repeat: | **Cachable** | outputs for each task and templated bits of task configurations can be cached given whatever parameters from the current context you want |
| :recycle: | **Reusable** | there might be certain common tasks that are interacted with in a number of ways (web applications, task queue processors, system messages) and you might want to re-use them no matter the source of execution |
| :package: | **Scalable and portable** | have as many nodes running your system as you like |
| :fast_forward: | **Rapid development** | most of the above points lead to much quicker development times |
| :baby_bottle: | **Easy to use** | once you get your head around the basic concepts, developing complex systems gets really quite simple |

## :bulb: Key concepts
There are a few concepts to help you get your head around how all of this works. The `Environment`, `TaskConfiguration`, `ObjectCompiler`, and the 5 types of `Module`. Each are explained below.

### :sunrise_over_mountains: The `Environment`
This is the base of the entire `low` system. An instance of this is created and loaded with all of your task configurations and modules. It does little other than initialise everything and act as your programs reference to the `low` system.

### :memo: The `TaskConfiguration`
Every program, job, website route, or whatever can be broken down into a simple task. Think of it as a function call. Take a web request for a not so simple search results page for instance, the entire arc can be broken down as follows:

1. [Auth provider] Check if the user is authenticated
2. [Database query] If they are authenticated get their user profile
3. [Search index query] Construct and execute a search query based on querystring parameters and user preferences (if they exist)
4. [Database query] Store constructed query in a users profile
5. [Renderer] Use a templating language to render the results to send back to the user

In `low` each of these steps can be represented as a simple configuration and grouped together using a special task type that executes tasks serially. Each of these tasks requires a bit of dynamic input based on the incoming HTTP request and results from previous tasks in the chain. That is where the `ObjectCompiler` comes in.

### :hammer: The `ObjectCompiler`
There are certain bits of JSON - such as your task configurations - which may need to change depending on what is being run.

> TODO: Finish writing key concepts!

## :construction: Development roadmap
None of this is ready for use yet! Here is a high level list of things that need to be done.

* :white_medium_square: Finish writing core package
  * :ballot_box_with_check: Add "run next" pointer to task output (need to work out how this will work)
  * :white_medium_square: Implement template/renderer caching
  * :white_medium_square: Implement optional type checking of inputs and outputs to `Doers`
  * :ballot_box_with_check: Finish writing unit tests and make sure core package is fit for purpose
* :white_medium_square: Write some basic modules to make the system usable
  * :white_medium_square: HTTP `Connector`
  * :white_medium_square: Cron `Connector`
  * :white_medium_square: RabbitMQ `Connector`
  * :white_medium_square: Redis `Cache Manager`
  * :white_medium_square: Memcached `Cache Manager`
  * :white_medium_square: Branching `Doer`
  * :white_medium_square: HTTP Request `Doer`
  * :white_medium_square: SQL Query `Doer`
  * :white_medium_square: Mustache `Renderer`
  * :white_medium_square: Handlebars `Renderer`
  * :white_medium_square: JSON-e `Renderer`
* :white_medium_square: Improve development and deployment process
  * :white_medium_square: Setup proper branching
  * :white_medium_square: Setup proper versioning with Git tags
  * :white_medium_square: Setup Travis-CI to test and deploy `master` to NPM
* :white_medium_square: Write a configuration builder (a command line tool that pieces together one big JSON file from lots of JSON files)
* :white_medium_square: Comment all code and implement Typedoc
* :white_medium_square: Write basic implementation examples and recipies
* :white_medium_square: Finish README.md
* :white_medium_square: Build a website explaining everything in a less rambly-technical way
* :white_medium_square: Create a browser based playground

Not all of this is completely necessary to start using the system. I will be working through the tasks loosely from top to bottom. Hopefully I'll soon start to use Github Issues and Projects to manage all this. I'm a lone developer with a full time job and a wife and toddler so finding the time to get through all this isn't super easy.