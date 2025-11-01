# LiftGraph - Powerlifting Progress Tracker

A React Native app for tracking powerlifting progress.

## Getting Started

### Project Structure

- `apps/mobile` - React Native app
- `packages/common` - Shared code between apps

### Prerequisites

- nvm
- yarn classic (v1)

### Installation

```bash
# install the correct node version
nvm install

# install the dependencies
yarn
```

### Development

#### Mobile

```bash
# start the mobile app
yarn mobile:start
```

### Installing dependencies

Always install dependencies in the workspace that is using them.

```bash
# install an expo version dependent package
yarn workspace @liftgraph/mobile expo add <package-name>

# install a package in the mobile app using yarn
yarn workspace @liftgraph/mobile add <package-name>
```

### Testing

```bash
# build using tsc
yarn build

# linting
yarn lint

# testing with jest
yarn test
```

