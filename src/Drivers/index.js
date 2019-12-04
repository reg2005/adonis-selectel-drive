'use strict'

const FileNotFoundException = require('../Exceptions/FileNotFoundException')
const SelectelStorage = require('./../Selectel')
/**
 * Selectel driver for flydrive
 *
 * @class Selectel
 */
class Selectel {
  constructor(config) {
    this.config = config
    this.selectel = new SelectelStorage()
  }

  /**
   * Finds if a file exists or not.
   *
   * @method exists
   * @async
   *
   * @param  {String} location
   *
   * @return {Promise<Boolean>}
   */
  async auth() {
    await this.selectel.auth(this.config.login, this.config.password)
  }

  /**
   * Finds if a file exists or not.
   *
   * @method exists
   * @async
   *
   * @param  {String} location
   *
   * @return {Promise<Boolean>}
   */
  async list() {
    await this.auth()
    let response = await this.selectel.fetchFiles(this.config.container, {
      format: "json"
    })
    return JSON.parse(response.body)
  }

  /**
   * Finds if a file exists or not.
   *
   * @method exists
   * @async
   *
   * @param  {String} location
   *
   * @return {Promise<Boolean>}
   */
  async exists(location) {
    try {
      return !!(await this.get(location))
    } catch (e) {
      return false
    }
  }

  /**
   * Create a new file.
   *
   * @method put
   * @async
   *
   * @param  {String} content
   * @param  {String} [location=content basename]
   * @param  {String} type
   *
   * @return {Promise<String>}
   */
  async put(hostingPath, fullLocalPath) {
    await this.auth()
    let response = await this.selectel.uploadFile(
      fullLocalPath,
      this.config.container + "/" + hostingPath
    )
    return response.url
  }

  /**
   * Remove a file.
   *
   * @method delete
   * @async
   *
   * @param  {String} location
   *
   * @return {Promise<Boolean>}
   */
  async delete(location) {
    await this.auth()
    const result = await this.selectel.deleteFile(
      this.config.container + "/" + location
    )
    return result
  }

  /**
   * Downloads and saves the object as a file in the local filesystem.
   *
   * @method get
   * @async
   *
   * @param  {String}  location
   * @param  {String}  outputPath
   *
   * @return {Promise<String>}
   */
  async get(location) {
    await this.auth()
    const result = await this.selectel.getFile(
      this.config.container + "/" + location
    )
    return result.body
  }

  /**
   * Copy file from one location to another within
   * or accross minio buckets.
   *
   * @method copy
   *
   * @param  {String} src
   * @param  {String} dest
   * @param  {String} [destBucket = this._bucket]
   *
   * @return {Promise<String>}
   */
  async copy(src, dest) {
    await this.auth()
    const result = await this.selectel.copyFile(
      this.config.container + "/" + src,
      this.config.container + "/" + dest
    )
    return result.body
  }

  /**
   * Moves file from one location to another. This
   * method will call `copy` and `delete` under
   * the hood.
   *
   * @method move
   *
   * @param  {String} src
   * @param  {String} dest
   * @param  {String} [destBucket = this._bucket]
   *
   * @return {Promise<String>}
   */
  async move(src, dest, destBucket) {
    const srcbucket = this._bucket.get()
    const url = await this.copy(src, dest, destBucket)
    await this.bucket(srcbucket).delete(src)
    return url
  }

  /**
   * Returns url for a given key. Note this method doesn't
   * validates the existence of file or it's visibility
   * status.
   *
   * @method getUrl
   *
   * @param  {String} location
   * @param  {String} bucket
   *
   * @return {String}
   */
  getUrl(location, bucket) {
    bucket = bucket || this._bucket.pull()
    const protocol = this.minioClient.protocol
    const host = this.minioClient.host
    const port = this.minioClient.port

    if (port === 80) {
      return `${protocol}//${host}/${bucket}/${location}`
    } else {
      return `${protocol}//${host}:${port}/${bucket}/${location}`
    }
  }

  /**
   * Presigned URLs are generated for temporary download/upload access to private objects.
   *
   * @method getSignedUrl
   * @async
   *
   * @param  {String}     location
   * @param  {Number}     [expiry = 600] 10 minutes
   *
   * @return {Promise<String>}
   */
  getSignedUrl(location, expiry = 600) {
    return new Promise((resolve, reject) => {
      this.exists(location)
        .then(exists => {
          if (!exists) return reject(FileNotFoundException.file(location))
          this.minioClient.presignedGetObject(
            this._bucket.pull(),
            location,
            expiry,
            function(err, presignedUrl) {
              if (err) return reject(err)
              return resolve(presignedUrl)
            }
          )
        })
        .catch(err => reject(err))
    })
  }
}

module.exports = Selectel
