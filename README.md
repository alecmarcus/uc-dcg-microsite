# UConn DCG Institute

Landing page for the upcoming DCG Institute at UConn. Built with TypeScript, HTML, SCSS, and bundled with Parcel.

## Developing

1. Clone & enter the directory:
```sh
cd uconn-gcd-inst
```

2. Install dependencies:

```sh
yarn
```

3. Start the server:
```sh
yarn start
```

## Deploying

Building the site is a breeze with Parcel.

```sh
yarn build
```

The production build will be output to `./dist`

### Configuring

You can control how Parcel transforms code for prod by creating and modifying a config file for the corresponding module(s).

For example, the config file `./.htmlnanorc` controls how markup is minified. The current config prevents some aggressive minification that would otherwise break SVGs on the site.

## Contents

```
.
├── assets                 # Most of the site lives in here
│   ├── fonts              # Font files
│   ├── scripts            # Scripts (written in TS) that power interactivity on the site
│   └── styles             # Styles, some CSS, some SASS
│       ├── components     # Styles for markup
│       ├── partials       # SASS vars, mixins, and functions
│       ├── fonts          # @font-face declarations
│       ├── index          # Entry point imported in index.html
│       ├── reset          # Browser reset
│       └── util           # CSS custom properties and global classes
├── dist                   # Output of the `yarn build` command goes here
├── .eslintrc              # eslint config
├── .prettierrc            # prettier config
├── .htmlnanorc            # Nano (HTML minifier) config (Parcel specific)
├── index.html             # Main entry point and all site markup
├── package.json           # You know what it is
├── README.md              # You are here
└── tsconfig.json          # TypeScript config
```
