var should = require('should'),
    dino = require('../lib/'),
    moment = require('moment');

describe('Schema', function(){
    
    var forumSchema,
        replySchema;
    
    beforeEach(function(){
        forumSchema = new dino.Schema('forums', {
            name: dino.types.String,
            misc: dino.types.Object
        }, {
            hash: 'name'
        });
        replySchema = new dino.Schema('replies', {
            forum_name: dino.types.String,
            subject: dino.types.String,
            date_created: dino.types.Date,
            id: dino.types.Id
        }, {
            hash: ['forum_name', 'subject'],
            range: ['date_created', 'id']
        });
    });
    
    describe('constructor', function(){
        it('sets the initial properties', function(){
            forumSchema.should.have.property('table', 'forums');
            forumSchema.should.have.property('attributes');
            forumSchema.should.have.property('hashKeyAttributes');
            forumSchema.should.have.property('hashKey', 'name');
            forumSchema.should.have.property('rangeKey', null);
            forumSchema.constructor.keyDelimiter.should.equal('#');
        });
    });
    describe('get', function(){
        it('gets the attributes', function(){
            forumSchema.get('name').should.be.an.instanceof(dino.types.String);
            forumSchema.get('misc').should.be.an.instanceof(dino.types.Object);
        });
    });
    describe('add', function(){
        it('adds the attributes', function(){
            forumSchema.add('newAttr', dino.types.Boolean);
            forumSchema.get('newAttr').should.be.an.instanceof(dino.types.Boolean);
        });
    });
    describe('generateHashAttribute', function(){
        it('generates the hash attribute', function(){
            var s = 'a';
            forumSchema.generateHashAttribute(s).should.eql({ S: s });
            replySchema.generateHashAttribute(['a', 'b']).should.eql({ S: 'a#b' });
        });
    });
    describe('generateRangeAttribute', function(){
        it('generates the range attribute', function(){
            var m = moment.utc(),
                id = '12345';
            replySchema.generateRangeAttribute([m, id]).should.eql({ S: m.format() + '#' + id });
        });
    });
    describe('deserializeHashAttribute', function(){
        it('deserializes the hash attribute', function(){
            var obj = forumSchema.deserializeHashAttribute({ S: 'sometablename' });
            obj.name.should.equal('sometablename');
        });
        it('deserializes combined hash attributes', function(){
            var obj = replySchema.deserializeHashAttribute({ S: 'what#ever' });
            obj.forum_name.should.equal('what');
            obj.subject.should.equal('ever');
        });
    });
    describe('deserializeRangeAttribute', function(){
        it('deserializes the range attribute', function(){
            var obj = replySchema.deserializeRangeAttribute({ S: '2013-03-27T19:21:54+00:00#12345' });
            obj.id.should.equal('12345');
            moment.isMoment(obj.date_created).should.be.true;
            obj.date_created.format().should.equal('2013-03-27T19:21:54+00:00');
        });
    });
});