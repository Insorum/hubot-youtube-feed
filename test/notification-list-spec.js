(function() {
    var chai = require('chai');
    var sinon = require('sinon');
    chai.use(require('sinon-chai'));
    var expect = chai.expect;

    describe('notification-list', function() {

        var list;
        var initialObject = {username: 'init-username', channel: '#init-channel'};

        beforeEach(function() {
            this.brain = {
                get: sinon.stub(),
                set: sinon.spy()
            };
            this.brain.get.returns([initialObject]);
            list = require('../src/lib/notification-list')(this.brain);
        });

        it('gets the initial information from the brain', function() {
            expect(this.brain.get).to.have.been.calledOnce;
            expect(list.notifications).to.be.deep.equal([initialObject]);
            expect(this.brain.set).to.have.not.been.called;
        });

        it('saves when adding a single notification', function() {
            var passed = list.addNotificationsFor('test-username', '#testchannel');

            var expectedObject = {username: 'test-username', channel: '#testchannel'};
            expect(passed).to.be.ok;
            expect(list.notifications).to.have.length(2);
            expect(list.notifications[0]).to.deep.equal(initialObject);
            expect(list.notifications[1]).to.deep.equal(expectedObject);
            expect(this.brain.set).to.have.been.calledWithExactly('youtubeFeed.notifyFor', [initialObject, expectedObject])
        });

        it('correctly identifies duplicates and doesnt save or add', function() {
            //duplicated
            var passed = list.addNotificationsFor('init-username', '#init-channel');
            expect(passed).to.not.be.ok;
            expect(list.notifications).to.have.length(1);
            expect(this.brain.set).to.have.not.been.called;

            //change channel
            passed = list.addNotificationsFor('init-username', '#init-channel-changed');
            expect(passed).to.be.ok;
            expect(list.notifications).to.have.length(2);
            expect(this.brain.set).to.have.been.calledOnce;

            //change username
            this.brain.set.reset();
            passed = list.addNotificationsFor('init-username-changed', '#init-channel');
            expect(passed).to.be.ok;
            expect(list.notifications).to.have.length(3);
            expect(this.brain.set).to.have.been.calledOnce;
        });

        it('saves when removing a single notification', function() {
            var passed = list.removeNotificationsFor('init-username', '#init-channel');

            expect(passed).to.be.ok;
            expect(list.notifications).to.have.length(0);
            expect(this.brain.set).to.have.been.calledWithExactly('youtubeFeed.notifyFor', [])
        });

        it('doesnt save or remove anything when no match', function() {
            var passed = list.removeNotificationsFor('init-username', '#init-channel-changed');

            expect(passed).to.not.be.ok;
            expect(list.notifications).to.have.length(1);
            expect(this.brain.set).to.have.not.been.called;

            passed = list.removeNotificationsFor('init-username-changed', '#init-channel');

            expect(passed).to.not.be.ok;
            expect(list.notifications).to.have.length(1);
            expect(this.brain.set).to.have.not.been.called;
        });

        it('can check if we are notifying for a username and channel', function() {
            list.addNotificationsFor('test-username-1', '#test-channel-1');
            list.addNotificationsFor('test-username-2', '#test-channel-2');
            list.addNotificationsFor('test-username-3', '#test-channel-3');
            expect(list.notifications).to.have.length(4);

            expect(list.isNotifyingFor('init-username', '#init-channel')).to.be.ok;
            expect(list.isNotifyingFor('init-username', '#init-channel-changed')).to.not.be.ok;
            expect(list.isNotifyingFor('init-username-changed', '#init-channel')).to.not.be.ok;
        });

        it('should set initial data if none already set', function() {
            var customBrain = {
                get: sinon.stub(),
                set: sinon.spy()
            };
            customBrain.get.returns(null);
            list = require('../src/lib/notification-list')(customBrain);

            expect(customBrain.get).to.have.been.calledOnce
            expect(customBrain.set).to.have.been.calledWithExactly('youtubeFeed.notifyFor', []);
        });
    });

}).call(this);
