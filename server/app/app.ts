import { HttpException } from '@app/classes/httpException/http.exception';
import { BestScoresController } from '@app/controllers/best-scores/best-scores.controller';
import { DictionariesController } from '@app/controllers/dictionaries/dictionaries.controller';
import { GameHistoryController } from '@app/controllers/game-history/game-history.controller';
import { TurnTimesController } from '@app/controllers/turn-times/turn-times.controller';
import { VirtualPlayerNameController } from '@app/controllers/virtual-name/virtual-player-name.controller';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as logger from 'morgan';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Container, Service } from 'typedi';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number;
    private readonly swaggerOptions: swaggerJSDoc.Options;
    private readonly dictionariesController: DictionariesController;
    private readonly turnTimesController: TurnTimesController;
    private readonly bestScoresController: BestScoresController;
    private readonly gameHistoryController: GameHistoryController;
    private readonly virtualPlayerNameController: VirtualPlayerNameController;

    constructor() {
        this.internalError = StatusCodes.INTERNAL_SERVER_ERROR;
        this.dictionariesController = Container.get(DictionariesController);
        this.turnTimesController = Container.get(TurnTimesController);
        this.bestScoresController = Container.get(BestScoresController);
        this.gameHistoryController = Container.get(GameHistoryController);
        this.virtualPlayerNameController = Container.get(VirtualPlayerNameController);

        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();

        this.bindRoutes();
    }

    bindRoutes(): void {
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.app.use('/api/dictionaries', this.dictionariesController.router);
        this.app.use('/api/turnTimes', this.turnTimesController.router);
        this.app.use('/api/bestScores', this.bestScoresController.router);
        this.app.use('/api/gameHistory', this.gameHistoryController.router);
        this.app.use('/api/virtualPlayerName', this.virtualPlayerNameController.router);
        this.app.use('/', (req, res) => {
            res.redirect('/api/docs');
        });
        this.errorHandling();
    }

    private config(): void {
        this.app.use(logger('dev'));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private errorHandling(): void {
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');

            next(err);
        });

        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
