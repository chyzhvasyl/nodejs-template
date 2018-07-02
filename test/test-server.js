var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');

var server = require('../server/server');
var Article = require('../server/models/article');

var should = chai.should();
chai.use(chaiHttp);


describe('Articles', function() {

  Article.collection.drop();

  beforeEach(function(done){
    let newArticle = new Article({
      title: 'Article one',
      body: 'This is article one'
    });

    newArticle.save(function(err) {
      done();
    });
  });
  afterEach(function(done){
    Article.collection.drop();
    done();
  });

  it('should list ALL articles on /articles GET', function(done) {
    chai.request(server)
      .get('/articles')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('title');
        res.body[0].should.have.property('body');
        res.body[0].title.should.equal('Article one');
        res.body[0].body.should.equal('This is article one');
        done();
      });
  });

  it('should list a SINGLE article on /article/<id> GET', function(done) {
      var newArticle = new Article({
        title: 'Article two',
        body: 'This is article two'
      });
      newArticle.save(function(err, data) {
        chai.request(server)
          .get('/article/'+data.id)
          .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('_id');
            res.body.should.have.property('title');
            res.body.should.have.property('body');
            res.body.title.should.equal('Article two');
            res.body.body.should.equal('This is article two');
            res.body._id.should.equal(data.id);
            done();
          });
      });
  });

  it('should add a SINGLE article on /articles POST', function(done) {
    chai.request(server)
      .post('/articles')
      .send({'title': 'Article free', 'body': 'This is article fhree'})
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.be.a('object');
        res.body.SUCCESS.should.have.property('title');
        res.body.SUCCESS.should.have.property('body');
        res.body.SUCCESS.should.have.property('_id');
        res.body.SUCCESS.title.should.equal('Article free');
        res.body.SUCCESS.body.should.equal('This is article fhree');
        done();
      });
  });

  it('should update a SINGLE article on /article/<id> PUT', function(done) {
    chai.request(server)
      .get('/articles')
      .end(function(err, res){
        chai.request(server)
          .put('/article/'+res.body[0]._id)
          .send({'title': '1', 'body': '2'})
          .end(function(error, response){
            response.should.have.status(200);
            response.should.be.json;
            response.body.should.be.a('object');
            response.body.should.have.property('UPDATED');
            response.body.UPDATED.should.be.a('object');
            response.body.UPDATED.should.have.property('title');
            response.body.UPDATED.should.have.property('_id');
            response.body.UPDATED.title.should.equal('1');
            done();
        });
      });
  });

  it('should delete a SINGLE article on /article/<id> DELETE', function(done) {
    chai.request(server)
      .get('/articles')
      .end(function(err, res){
        chai.request(server)
          .delete('/article/'+res.body[0]._id)
          .end(function(error, response){
            response.should.have.status(200);
            response.should.be.json;
            response.body.should.be.a('object');
            response.body.should.have.property('REMOVED');
            response.body.REMOVED.should.be.a('object');
            response.body.REMOVED.should.have.property('title');
            response.body.REMOVED.should.have.property('_id');
            response.body.REMOVED.title.should.equal('Article one');
            done();
        });
      });
  });
});