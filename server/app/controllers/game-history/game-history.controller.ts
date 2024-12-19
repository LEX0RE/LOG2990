import { FAILED_DELETE_HISTORY, FAILED_GET_HISTORY } from '@app/constants/error/error-messages';
import { GameHistory } from '@app/services/game-history/game-history.service';
import { GameInfoHistory } from '@common/interfaces/game-information';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container, Service } from 'typedi';

@Service()
export class GameHistoryController {
    router!: Router;
    private readonly gameHistoryService: GameHistory;

    constructor() {
        this.gameHistoryService = Container.get(GameHistory);
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * definitions:
         *   Message:
         *     type: object
         *     properties:
         *       title:
         *         type: string
         *       body:
         *         type: string
         */

        /**
         * @swagger
         * tags:
         *   - name: Time
         *     description: Time endpoints
         */

        /**
         * @swagger
         *
         * /api/gameHistory:
         *   get:
         *     description: Retourne l'historique des parties
         *     tags:
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         */
        this.router.get('/', async (request: Request, response: Response) => {
            this.gameHistoryService
                .getHistory()
                .then((gameInfoHistory: GameInfoHistory[]) => response.json(gameInfoHistory))
                .catch(() => response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(FAILED_GET_HISTORY));
        });

        /**
         * @swagger
         *
         * definitions:
         *   Message:
         *     type: object
         *     properties:
         *       title:
         *         type: string
         *       body:
         *         type: string
         */

        /**
         * @swagger
         * tags:
         *   - name: Time
         *     description: Time endpoints
         */

        /**
         * @swagger
         *
         * /api/gameHistory:
         *   delete:
         *     description: Supprime l'historique des parties
         *     tags:
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       204:
         */
        this.router.delete('/', async (request: Request, response: Response) => {
            this.gameHistoryService
                .deleteHistory()
                .then(() => response.sendStatus(StatusCodes.NO_CONTENT))
                .catch(() => response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(FAILED_DELETE_HISTORY));
        });
    }
}
