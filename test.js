'use strict'

var createPackage = require('./create-test-package.js')
var rimraf = require('rimraf')
var path = require('path')
var test = require('tape')
var fs = require('fs')

var createdDirs = []

test('make sure it creates a thing!', function (assert) {
  var pkg = null

  return createPackage('hello-%s', {}, onpkg)

  function onpkg (err, pkg_) {
    if (err) {
      return assert.end(err)
    }

    createdDirs.push(pkg_.dir)
    pkg = pkg_
    fs.readFile(path.join(pkg.dir, 'package.json'), 'utf8', ondata)
  }

  function ondata (err, data) {
    if (err) {
      return assert.end(err)
    }

    assert.ok(/hello-\d+-\w+/.test(pkg.name), 'name works as expected')
    assert.deepEqual(JSON.parse(data), {name: pkg.name})
    assert.end()
  }
})

test('make sure it removes a thing!', function (assert) {
  return createPackage('gooble-%s', {})
    .then(onpkg)
    .then(check)
    .then(assert.end.bind(null, null))
    .catch(assert.end)

  function onpkg (pkg) {
    createdDirs.push(pkg.dir)
    return pkg.delete()
  }

  function check (pkg) {
    return new Promise(function (resolve, reject) {
      fs.stat(pkg.dir, function (err, stat) {
        assert.ok(!stat)
        assert.equal(err.code, 'ENOENT')
        resolve()
      })
    })
  }
})

test('delete created dirs', function (assert) {
  var pending = createdDirs.length
  createdDirs.forEach(function (xs) {
    rimraf(xs, function () {
      if (!--pending) {
        assert.end()
      }
    })
  })
})
