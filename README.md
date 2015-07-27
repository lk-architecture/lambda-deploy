# Lambda deploy

### Workflow

- build project into zip bundle
- upload bundle to S3
- create/update the lambda function

If the lambda function does not exist, the script creates it. However, it _does
not_ configure event sources and other parameters. Manual intervention is
therefore required.

### Conventions to follow

#### Source code compilation

Source code goes into `src/`.
Source code is compiled by [babel](https://babeljs.io/).
The function entry point is the `handler` function exported in `src/index.js`.
Dependencies must be listed in `package.json`.

#### Build configuration

The following environment variables are needed to deploy the function:

- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_DEFAULT_REGION`
- `S3_BUCKET`
- `LAMBDA_NAME`
- `LAMBDA_ROLE_ARN`
- `GIT_BRANCH`, equivalently `TRAVIS_BRANCH`
- `GIT_COMMIT`, equivalently `TRAVIS_COMMIT`
- `GIT_PULL_REQUEST`, equivalently `TRAVIS_PULL_REQUEST` (optional)
- `GIT_TAG`, equivalently `TRAVIS_TAG` (optional)

WARNING: the value of those variables must be kept secret. If using Travis, do
not set them in the `.travis.yml` config file, only in the Travis project's
settings (where they are kept secret).

#### Runtime configuration

To pass runtime configurations to the function, set environment variables
prefixed by `FUNC_CONFIG:`. Those will be collected and written to the `.env`
file from where they can be loaded using [dotenv](https://github.com/motdotla/dotenv).

For example, if we define the following environment variables in the build
environment:

```sh
env DB_HOST=localhost
env DB_USER=root
env DB_PASS=s1mpl3
```

then the following `.env` file is generated:

```txt
DB_HOST=localhost
DB_USER=root
DB_PASS=s1mpl3
```

which can be loaded by the lambda function with:

```js
import {load} from "dotenv";
load();

export function handler (event, context) {
    context.succeed(JSON.stringify(process.env));
}
```

### Output

The script bundles the current repository and uploads it to AWS S3. The name of
the bundle is derived from the following parameters:

- `LAMBDA_NAME`
- `GIT_BRANCH`
- `GIT_COMMIT`
- `GIT_TAG`
- `GIT_PULL_REQUEST`

The name of the lambda function is derived from the following parameters:

- `LAMBDA_NAME`
- `GIT_BRANCH`
