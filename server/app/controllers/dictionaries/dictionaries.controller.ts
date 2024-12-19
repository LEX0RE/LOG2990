import { ERROR } from '@app/constants/error/controller';
import { ClientDictionary, DictionaryWithWords } from '@app/interface/dictionary-interface';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container, Service } from 'typedi';

@Service()
export class DictionariesController {
    router!: Router;
    private readonly dictionariesService: DictionaryService;

    constructor() {
        this.dictionariesService = Container.get(DictionaryService);
        this.configureRouter();
    }

    // eslint-disable-next-line max-lines-per-function -- Ne fait que configurer les difféntes réponses selon les requêtes
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
         * /api/dictionaries:
         *   get:
         *     description: Retourne les dictionnaires et leur description
         *     tags:
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */
        this.router.get('/', (_request: Request, response: Response) => {
            this.dictionariesService
                .getDictionaries()
                .then((dictionaries: ClientDictionary[]) => response.json(dictionaries))
                .catch((reason: unknown) => response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ title: ERROR, body: reason as string }));
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
         * /api/dictionaries:
         *   get:
         *     description: Retourne le dictionnaire correspondant au titre
         *     tags:
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */
        this.router.get('/:title', (request: Request, response: Response) => {
            this.dictionariesService
                .getDictionaryDownload(request.params.title)
                .then((dictionary: DictionaryWithWords) => response.json(dictionary))
                .catch((error: Error) => response.status(StatusCodes.NOT_FOUND).send(error.message));
        });

        /**
         * @swagger
         *
         * /api/dictionaries:
         *   post:
         *     description:  Ajoute un dictionnaire au serveur
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
        this.router.post('/', async (request: Request, response: Response) => {
            this.dictionariesService
                .uploadDictionary(request.body)
                .then(() => {
                    response.status(StatusCodes.CREATED).json(null);
                })
                .catch((error: Error) => {
                    response.sendStatus(StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        /**
         * @swagger
         *
         * /api/dictionaries:
         *   patch:
         *     description: Modifie un dictionnaire sur le serveur
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

        this.router.patch('/:oldTitle', async (request: Request, response: Response) => {
            this.dictionariesService
                .modifyDictionary(request.body, request.params.oldTitle)
                .then(() => response.status(StatusCodes.OK).json(null))
                .catch((error: Error) => response.sendStatus(StatusCodes.NOT_FOUND).send(error.message));
        });

        /**
         * @swagger
         *
         * /api/dictionaries:
         *   delete:
         *     description: Supprime un nom de la base de données
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
        this.router.delete('/:dictionaryId', async (request: Request, response: Response) => {
            this.dictionariesService
                .deleteDictionary(Number(request.params.dictionaryId))
                .then(() => response.sendStatus(StatusCodes.NO_CONTENT))
                .catch((error: Error) => response.sendStatus(StatusCodes.NOT_FOUND).send(error.message));
        });

        /**
         * @swagger
         *
         * /api/dictionaries:
         *   post:
         *     description: Supprime tous les dictionnaires sauf celui par défaut
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
        this.router.delete('/', async (_request: Request, response: Response) => {
            this.dictionariesService
                .deleteAll()
                .then(() => response.sendStatus(StatusCodes.NO_CONTENT))
                .catch((error: Error) => response.sendStatus(StatusCodes.NOT_FOUND).send(error.message));
        });
    }
}
