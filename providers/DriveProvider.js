'use strict'
const { ServiceProvider } = require('@adonisjs/fold')
const Selectel = require('../src/Drivers')
class DriveProvider extends ServiceProvider {
  register () {
    this.app.extend('Adonis/Addons/Drive', 'sel', () => {
      return Selectel
    })
  }
}

module.exports = DriveProvider
