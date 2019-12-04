require('dotenv').config()
const test = require('japa')
const { Config } = require('@adonisjs/sink')
const { ioc, registrar } = require('@adonisjs/fold')
const path = require('path')
const fs = require('fs')
registrar.providers(['@adonisjs/drive/providers/DriveProvider', path.join(__dirname, './../providers/DriveProvider.js')]).register()

test.group('SelectelDriveManager', () => {
  test('interact with cloud filesystem', async (assert) => {
    ioc.bind('Adonis/Src/Config', () => {
      const config = new Config()
      config.set('drive', {
        default: 'sel',

        disks: {
          local: {
            driver: 'local',
            root: __dirname
          },
          sel: {
            driver: 'sel',
            login: process.env['SELECTEL_LOGIN'],
            password: process.env['SELECTEL_PASSWORD'],
            container: process.env['SELECTEL_CONTAINER'],
            container_url: process.env['SELECTEL_CONTAINER_URL']
          }
        }
      })
      return config
    })

    const testFileContent = fs.readFileSync(__dirname + '/../assets/example.txt')
    const drive = use('Drive')

    let list = await drive.list()
    for await (item of list) {
      await drive.get(item.name)
      await drive.delete(item.name)
    }

    list = await drive.list()
    assert.equal(list.length, 0)
    const url = await drive.put("test/example.txt", testFileContent);

    assert.equal(!!url, true)
    list = await drive.list()
    assert.equal(list.length, 1)
    await drive.copy('test/example.txt', 'test2/werwrw.txt')
    assert.equal(await drive.exists('test2/werwrw.txt'), true)
    list = await drive.list()
    for await (item of list){
      assert.equal(await drive.get(item.name), testFileContent)
      await drive.delete(item.name)
    }
    list = await drive.list()
    assert.equal(list.length, 0)
  }).timeout(0)
})
