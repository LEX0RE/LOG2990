import { ExpertPlayer } from '@app/classes/players/virtual-player/expert-player/expert-player';
import { VirtualPlayer } from '@app/classes/players/virtual-player/virtual-player-abstract';
import { EXPERT_ID } from '@app/constants/id-virtual-player';
import { Hint } from '@app/interface/hint';
import { stubVirtualPlayer } from '@app/test/classes-stubs/virtual-player-stub';
import { FAKE_PLACE_ACTION_4, LONG_FAKE_HINTS } from '@app/test/constants/fake-hints';
import { FAKE_PLAYER_1_NAME, FAKE_SOCKET_ID_PLAYER_1 } from '@app/test/constants/fake-player';
import { doNothing } from '@app/test/do-nothing-function';
import { ServiceStubHelper } from '@app/test/service-stubs';
import { expect } from 'chai';
import { describe } from 'mocha';
import { assert, restore, spy } from 'sinon';

describe('ExpertPlayer', () => {
    let stubs: ServiceStubHelper;
    let abstractPlayer: VirtualPlayer;
    let player: ExpertPlayer;

    let hint: Hint[];

    beforeEach(() => {
        stubs = new ServiceStubHelper();
        abstractPlayer = stubVirtualPlayer();
        player = new ExpertPlayer(abstractPlayer.name, abstractPlayer.id);

        // eslint-disable-next-line dot-notation -- Propriété privée
        stubs.gameManager.getGameByPlayerId.returns(abstractPlayer['game']);
        stubs.chatManager.sendToOthersInChat.callsFake(doNothing);

        hint = LONG_FAKE_HINTS();
    });

    afterEach(() => restore());

    it('should create a simple expert player', () => {
        expect(player).to.ownProperty('name', FAKE_PLAYER_1_NAME);
        expect(player).to.ownProperty('id', FAKE_SOCKET_ID_PLAYER_1 + EXPERT_ID);
        expect(player).to.haveOwnProperty('requiredUpdates', false);
    });

    it('action should return action with the biggest score if there has possibilities', () => {
        stubs.gameplay.getPossibilities.returns(Promise.resolve(hint));
        player.handleAction().then((action) => {
            expect(action).to.equal(FAKE_PLACE_ACTION_4());
        });
    });

    it('action should call trade if there has not possibility', () => {
        stubs.gameplay.getPossibilities.returns(Promise.resolve([]));
        const spyTrade = spy(player, 'trade');

        player.handleAction().then(() => {
            assert.calledOnce(spyTrade);
        });
    });

    it('chooseTradeAction should call tradeLetters', () => {
        const stashSize = 5;
        const spyTradeLetters = spy(player, 'tradeLetters');

        player.chooseTradeAction(stashSize);

        assert.calledOnce(spyTradeLetters);
    });

    it('chooseTradeAction should call skipAction if stash has zero letter', () => {
        const stashSize = 0;
        const spySkipAction = spy(player, 'skipAction');

        player.chooseTradeAction(stashSize);

        assert.calledOnce(spySkipAction);
    });
});
