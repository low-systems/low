# Scenario: Shell

Need a special `ShellConnector` which handles:
* Connections on a given port and interface
* Session management

It registers all subroutines with a `ShellConnector` configuration.

On each connection it creates a 3 stream bundle (STDIN, STDOUT, STDERR) which it maintains for each session and are passed to each subroutine as they are executed. To be fancy there should be a way to create and connect to new bundles

As most Doers at the moment don't really care about streams they may not be used but some Connection Configuration can tell a subroutine to write Doer outputs to the STDOUT stream
