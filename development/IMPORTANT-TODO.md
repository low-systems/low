# IMPORTANT LIST OF THINGS TO FINISH THE MVP

## Introduce namespaces
All tasks now have a namespace

## Change the `MultiDoer` into a `Subroutine`
Basically all these baked ideas you've been having. Remember that all sub-tasks are dynamic.
  * A `Subroutine` could have many channels but by default two: `default` and `error`
  * An inheritable method for running a channel of tasks is included.
  * The idea of a `data` object only exists within a `Subroutine`.
  * A `data object can be provided to the `Subroutine`. This can also be constructed by a `Connector` and could hold HTTP request information etc.
  * A timeout should be provided and I need to investigate Promise hooks for
    killing channels that are taking too long.
  * An signaling system for what happens after each task. Signals for things like:
    * setting data,
    * reporting errors,
    * halting execution,
    * branching to another channel or subroutine
  * A `Subroutine` could be inherited by some kind of stream reading `Doer`
  * Also think of the possibilities dealing with the request and response in an `HttpConnector` as actual streams
  * Optionally override or set the namespaces of child tasks?

## Incorporate method hooks system
Pinch the code from the `low` scratch project

## Improve `Module` secrets and configs concept
  * No longer have secrets for `Module`s. They should be passed into whatever "core" method is being executed.
  * Reduce the number of arguments public methods can take. They should no longer know about the `Context` unless they are `Renderer`s. `Doer.core()` should only accept an `input: any`

## Make an `Environment` messaging system
This is used for initialising modules but also:
  * Loading/unloading templates
  * Providing a way of using method hooks
  * Calling other subroutines. To do this there would have to be a `Connector` that runs tasks based on messages

Typical Topic/Subscriber setup with messages carrying a body. Different primitives would have thier own standard things to listen out for.



# STRETCH GOAL
A `Doer` that could take a namespace and bundle all of its tasks and produce a Javascript file that bundles `low` for the browser and loads all tasks from that given namespace, and loads all modules. Create browser `Doers` (pinch the ones from the Component Manager) and a `DomEventConnector` to work with this.

The `DomEventConnector` would also need to load inline tasks from a rendered web page. Is should be able to work with both a real or virtual dom. It could also operate as a server-side rendered SPA framework. Coming up with a common pattern for all back-end tasks to know when to render a complete page or just a small part of it. Think about how this would work with templates and different templating languages.