# Cloud Tasks Doer
A Google Cloud Tasks Doer for `low`

## Important setup required for unit tests to work
As this doer's whole schtick is to talk to a Google Cloud Tasks instance, testing it is a little
hard without some configuration from you. Unfortunately - as of 2019-11-14 - there is no Cloud
Tasks emulator and obviously we're not going to leave our client details and credentials in a
public Git repository so you'll need to setup two files for the unit tests to run. Both of these
files sit in a directory at the root of this module called `./configuration`.

**THESE TESTS WILL CONNECT TO A CLOUD TASKS INSTANCE AND CREATE AND MANIPULATE QUEUES. DON'T CONNECT THIS TO AN IMPORTANT PRODUCTION ENVIRONMENT WHERE THEY MIGHT OVERWRITE SOMETHING IMPORTANT**

### `client.secrets.ts`
All tests will use a Cloud Tasks Client named `test-client` and it's configuration is taken from this
file. [It's schema can be taken from here](https://googleapis.dev/nodejs/tasks/latest/v2.CloudTasksClient.html).
This Doer will insert credentials from the environment secrets so please omit them from your
configuration. Remember that all these options are optional.

You also cannot use the `options.promise` property as it expects a function which replaces the
native Node.JS promise handler. `low`'s purpose is to be purely configuration based and as such
expects certain things about your Node.JS environment. One of these things is that native Promises
can be used. I'm sure there is a way of mucking about with Typescript compiler settings to shim
your own Promise handler but that is outside of the scope of `low`.

It might look a little something like this

```
export default {
  "options": {
    "projectId": "my-awesome-project",
    "apiEndpoint": "my-awesome-app.com"
  }
};
```

### `secrets.json`
This is the file that is loaded by `jest` to act as your environment secrets (see `low`
documentation on secrets). Obviously you won't want to stick private keys and other credentials
in your main environment configuration and this doer will load Cloud Tasks Client's credentials
from environment secrets. If you really wanted too you can store your credentials in the doer's
configuration but it is not recommended. For the purposes of testing we want to make sure that
credentials can be loaded from secrets.

This file should look like this

```
export default {
  "modules": {
    "CloudTasksDoer": {
      "clientCredentials": {
        "test-client": {
          "client_email": "some-service-user@googleapis.com",
          "private_key": "Not going to come up with a dummy private key to go here"
        }
      }
    }
  }
};
```
