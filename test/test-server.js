const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const server = require('../server/server');
const Note = require('../server/models/note');

const should = chai.should();
chai.use(chaiHttp);


describe('Notes', function() {

  Note.collection.drop();

  beforeEach(function(done){
    var newNote = new Note({
      title: 'Note one',
      body: 'This is note one'
    });
    newNote.save(function(err) {
      done();
    });
  });
  afterEach(function(done){
    Note.collection.drop();
    done();
  });

  it('should list ALL notes on /notes GET', function(done) {
    chai.request(server)
      .get('/notes')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('title');
        res.body[0].should.have.property('body');
        res.body[0].title.should.equal('Note one');
        res.body[0].body.should.equal('This is note one');
        done();
      });
  });

  it('should list a SINGLE note on /note/<id> GET', function(done) {
      var newNote = new Note({
        title: 'Note two',
        body: 'This is note two'
      });
      newNote.save(function(err, data) {
        chai.request(server)
          .get('/note/'+data.id)
          .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('_id');
            res.body.should.have.property('title');
            res.body.should.have.property('body');
            res.body.title.should.equal('Note two');
            res.body.body.should.equal('This is note two');
            res.body._id.should.equal(data.id);
            done();
          });
      });
  });

  it('should add a SINGLE note on /notes POST', function(done) {
    chai.request(server)
      .post('/notes')
      .send({'title': 'Note free'})
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('SUCCESS');
        res.body.SUCCESS.should.be.a('object');
        res.body.SUCCESS.should.have.property('title');
        res.body.SUCCESS.should.have.property('body');
        res.body.SUCCESS.should.have.property('_id');
        res.body.SUCCESS.title.should.equal('Note free');
        res.body.SUCCESS.body.should.equal('This is note fhree');
        done();
      });
  });

  it('should update a SINGLE note on /note/<id> PUT', function(done) {
    chai.request(server)
      .get('/notes')
      .end(function(err, res){
        chai.request(server)
          .put('/note/'+res.body[0]._id)
          .send({'title': 'Note Two'})
          .end(function(error, response){
            response.should.have.status(200);
            response.should.be.json;
            response.body.should.be.a('object');
            response.body.should.have.property('UPDATED');
            response.body.UPDATED.should.be.a('object');
            response.body.UPDATED.should.have.property('title');
            response.body.UPDATED.should.have.property('_id');
            response.body.UPDATED.title.should.equal('Note Two');
            done();
        });
      });
  });

  it('should delete a SINGLE note on /note/<id> DELETE', function(done) {
    chai.request(server)
      .get('/notes')
      .end(function(err, res){
        chai.request(server)
          .delete('/note/'+res.body[0]._id)
          .end(function(error, response){
            response.should.have.status(200);
            response.should.be.json;
            response.body.should.be.a('object');
            response.body.should.have.property('REMOVED');
            response.body.REMOVED.should.be.a('object');
            response.body.REMOVED.should.have.property('title');
            response.body.REMOVED.should.have.property('_id');
            response.body.REMOVED.title.should.equal('Note one');
            done();
        });
      });
  });

});