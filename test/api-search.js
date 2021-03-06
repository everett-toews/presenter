'use-strict';
/* globals it describe beforeEach */

const before = require('./helpers/before');
const config = require('../src/config');

config.configure(before.settings);

const request = require('supertest');
const nock = require('nock');
const server = require('../src/server');
const ControlService = require('../src/services/control');

describe('/_api/search', function () {
  beforeEach(before.reconfigure);
  beforeEach((done) => {
    ControlService.load('sha', (ok) => {
      if (!ok) return done(new Error('Control repository load failed'));
      done();
    });
  });

  it('returns matching documents', function (done) {
    nock('http://content')
      .get('/search?q=is&pageNumber=3&perPage=2')
      .reply(200, {
        total: 11,
        results: [
          {
            contentID: 'https://github.com/deconst/fake/one',
            title: 'first',
            excerpt: 'this <em>is</em> result one'
          },
          {
            contentID: 'https://github.com/deconst/subrepo/somepath',
            title: 'second',
            excerpt: 'this <em>is</em> result two'
          }
        ]
      });

    request(server.create())
      .get('/_api/search?q=is&pageNumber=3&perPage=2')
      .expect(200)
      .expect({
        total: 11,
        pages: 6,
        results: [
          {
            contentID: 'https://github.com/deconst/fake/one',
            url: 'https://deconst.horse/one/',
            title: 'first',
            excerpt: 'this <em>is</em> result one'
          },
          {
            contentID: 'https://github.com/deconst/subrepo/somepath',
            url: 'https://deconst.horse/subrepo/somepath/',
            title: 'second',
            excerpt: 'this <em>is</em> result two'
          }
        ]
      }, done);
  });

  it('has a different URL segment based on the configuration', (done) => {
    before.reconfigureWith({ PRESENTER_API_PATH: 'different' })();

    nock('http://content')
      .get('/search?q=is')
      .reply(200, {
        total: 1,
        results: [
          {
            contentID: 'https://github.com/deconst/fake/one',
            title: 'first',
            excerpt: 'this <em>is</em> result one'
          }
        ]
      });

    request(server.create())
      .get('/different/search?q=is')
      .expect(200)
      .expect({
        total: 1,
        pages: 1,
        results: [
          {
            contentID: 'https://github.com/deconst/fake/one',
            url: 'https://deconst.horse/one/',
            title: 'first',
            excerpt: 'this <em>is</em> result one'
          }
        ]
      }, done);
  });
});
