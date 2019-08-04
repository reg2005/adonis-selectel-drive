# Selectel CloudStorage drive

# Requirements
- [AdonisJS Drive](https://github.com/adonisjs/adonis-drive) (`adonis install @adonisjs/drive`)

# Installation
```
adonis install adonis-selectel-drive
```

# Instructions
Make sure to register the provider inside `start/app.js` file.

```js
const providers = [
  ...
  'adonis-selectel-drive/providers/DriveProvider'
]
```

Add new configuration inside `disks` module in `config/drive.js`:

```js
selectel: {
  driver: 'selectel',
  login: Env.get('SELECTEL_LOGIN'),
  password: Env.get('SELECTEL_PASSWORD'),
  container: Env.get('SELECTEL_CONTAINER'),
  container_url: Env.get('SELECTEL_CONTAINER_URL')
}
```

Add selectel variables in `.env`:
```
SELECTEL_LOGIN=
SELECTEL_PASSWORD=
SELECTEL_CONTAINER=
SELECTEL_CONTAINER_URL=
```

# Examples
## Find if a file exists or not.

```js
const isExists = await Drive.disk('selectel').exists('adonis.jpeg')
```

Complete example please go to [this link](examples/routes.js)

# Thanks
Special thanks to the creator(s) of [AdonisJS](http://adonisjs.com/) for creating such a great framework.

This is a boilerplate for creating AdonisJs Addons. It is suggested to read [addons guide](http://adonisjs.com/recipes/making-adonis-addons) to learn more about the development process.

## Dependencies
This project includes following dependencies, you are free to remove them.

1. [japa](https://github.com/thetutlage/japa) - Test runner to run tests
2. [standardjs](https://standardjs.com/) - Code linter

