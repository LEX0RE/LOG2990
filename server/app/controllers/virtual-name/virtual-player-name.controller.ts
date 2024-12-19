import {
    FAILED_DELETE_NAME,
    FAILED_DELETE_NAMES,
    FAILED_GET_NAME,
    FAILED_GET_NAMES,
    FAILED_INSERT_NAME,
    FAILED_UPDATE_NAME,
} from '@app/constants/error/error-messages';
import { VirtualPlayerNameService } from '@app/services/virtual-player-name/virtual-player-name.service';
import { CommonVirtualPlayerName } from '@common/game-view-related/common-virtual-player-name';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container, Service } from 'typedi';

@Service()
export class VirtualPlayerNameController {
    router!: Router;
    private readonly virtualPlayerNameService: VirtualPlayerNameService;

    constructor() {
        this.virtualPlayerNameService = Container.get(VirtualPlayerNameService);
        this.configureRouter();
    }

    // eslint-disable-next-line max-lines-per-function -- Dans le but de bien faire l'ensemble des routes
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
         * /api/virtualPlayerName:
         *   get:
         *     description: Retourne tous les noms des joueurs virtuels pour les deux niveaux de difficulté
         *     tags:
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         */

        this.router.get('/:difficulty', async (req: Request, res: Response) => {
            this.virtualPlayerNameService
                .getAllNames(req.params.difficulty)
                .then((names: CommonVirtualPlayerName[]) => res.json(names))
                .catch(() => res.status(StatusCodes.NOT_FOUND).send(FAILED_GET_NAMES));
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
         * /api/virtualPlayerName:
         *   get:
         *     description: Retourne le nom d'un joueur virtuel pour chaque niveau de difficulté
         *     tags:
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         */

        this.router.get('/:difficulty/:name', async (req: Request, res: Response) => {
            this.virtualPlayerNameService
                .getName(req.params.difficulty, req.params.name)
                .then((name: CommonVirtualPlayerName) => res.json(name))
                .catch(() => res.status(StatusCodes.NOT_FOUND).send(FAILED_GET_NAME));
        });

        /**
         * @swagger
         *
         * /api/virtualPlayerName:
         *   post:
         *     description: Ajoute un nom à la base de données
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
         *       201:
         *         description: Created
         */

        this.router.post('/:difficulty', async (req: Request, res: Response) => {
            this.virtualPlayerNameService
                .addName(req.params.difficulty, req.body)
                .then(() => res.status(StatusCodes.CREATED).json(null))
                .catch(() => res.status(StatusCodes.NOT_FOUND).send(FAILED_INSERT_NAME));
        });

        /**
         * @swagger
         *
         * /api/virtualPlayerName:
         *   post:
         *     description: Modifie un nom de la base de données
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
         *        200:
         *         description: Ok
         */

        this.router.patch('/:difficulty', async (req: Request, res: Response) => {
            this.virtualPlayerNameService
                .modifyName(req.params.difficulty, req.body.old, req.body.new)
                .then(() => res.status(StatusCodes.OK).json(null))
                .catch(() => res.status(StatusCodes.NOT_FOUND).send(FAILED_UPDATE_NAME));
        });

        /**
         * @swagger
         *
         * /api/virtualPlayerName:
         *   post:
         *     description: supprime un nom de la base de données
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
        this.router.delete('/:difficulty/:name', async (req: Request, res: Response) => {
            this.virtualPlayerNameService
                .deleteName(req.params.difficulty, req.params.name)
                .then(() => res.sendStatus(StatusCodes.NO_CONTENT))
                .catch(() => res.status(StatusCodes.NOT_FOUND).send(FAILED_DELETE_NAME));
        });

        /**
         * @swagger
         *
         * /api/virtualPlayerName:
         *   post:
         *     description: Réinitialise les noms des joueurs virtuels
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
            this.virtualPlayerNameService
                .deleteAll()
                .then(() => res.sendStatus(StatusCodes.NO_CONTENT))
                .catch(() => res.status(StatusCodes.NOT_FOUND).send(FAILED_DELETE_NAMES));
        });
    }
}
