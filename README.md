<h2 align="center"  style="margin-bottom: 10px"><a href="https://antwerp.hogg.io">https://hogg.io</a></h2>

<p align="center"  style="margin-top: 0px">
  My personal website, which I use as a playground for my own learnings and experiments.
</p>

### Technology

- [Typescript](https://www.typescriptlang.org/)
- [Parcel](https://parceljs.org/) (bundler and dev servers)
- [React](https://reactjs.org/)
- [PostCSS](https://postcss.org/) (with postcss-preset-env for a little power)
- [Firebase](https://firebase.google.com/) (hosting)

### Setup

##### Prerequisites

• [Node](https://nodejs.org/en/) - Either use [nvm use](https://github.com/nvm-sh/nvm) or checkout the tested version inside the [.nvmrc](./nmvrc) file.

##### Setup

Clone the repository

```
git clone git@github.com:HHogg/antwerp.git
```

Install the dependencies with your favourite package manager

```
yarn install
```

##### Running

Spin up the Parcel development server

```
yarn start
```

##### Building

Build the static files using Parcel

```
yarn build
```

##### Deploying

Deploy to Firebase hosting (... after authenticating)

```
yarn deploy
```
