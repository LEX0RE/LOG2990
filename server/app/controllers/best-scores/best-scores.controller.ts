import { FAILED_DELETE_BEST_SCORES, FAILED_GET_BEST_SCORES } from '@app/constants/error/error-messages';
import { BestScoreService } from '@app/services/best-score/best-score.service';
import { CommonBestScore } from '@common/interfaces/game-view-related/common-best-score';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container, Service } from 'typedi';

@Service()
export class BestScoresController {
    router!: Router;
    private readonly bestScoreService: BestScoreService;

    constructor() {
        this.bestScoreService = Container.get(BestScoreService);
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
         * /api/bestScores:
         *   get:
         *     description: retourne les meilleurs scores pour les deux modes de jeu
         *     tags:
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */

        this.router.get('/:gameMode', async (req: Request, res: Response) => {
            this.bestScoreService
                .getAllBestScore(req.params.gameMode)
                .then((bestScores: CommonBestScore[]) => res.json(bestScores))
                .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(FAILED_GET_BEST_SCORES));
        });

        /**
         * @swagger
         *
         * /api/bestScores:
         *   delete:
         *     description: réinitialise tous les meilleurs scores
         *     tags:
         *       - Example
         *       - Message
         *     requestBody:
         *         description: message object
         *         required: true
         *         content:
         *           application/json:
         *     produces:
         *       - application/json
         *     responses:
         *       204:
         *         description: No content
         */

        this.router.delete('/', async (req: Request, res: Response) => {
            this.bestScoreService
                .deleteAllBestScores()
                .then(() => res.sendStatus(StatusCodes.NO_CONTENT))
                .catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(FAILED_DELETE_BEST_SCORES));
        });
    }
}
