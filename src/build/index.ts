import {BuilderContext, BuilderOutput, createBuilder} from '@angular-devkit/architect';
import * as childProcess from 'child_process';
import * as rimraf from 'rimraf';
import {Observable} from 'rxjs';
import {copy} from '../helpers/copy';
import {Options} from "../types";

let buildFunc = createBuilder<Options>((options, context): Promise<BuilderOutput> | Observable<BuilderOutput> => {
    if (options.clean) {
        options.clean.forEach((dir) => rimraf.sync(`${context.currentDirectory}/${dir}`));
    }
    let runAndBuild = !(options.runAndBuild === undefined || !options.runAndBuild);
    let buildPromise = buildOnlyMode(context, options);

    if (!runAndBuild) {
        buildPromise.then(() => copy(options.copy));

        return buildPromise;
    }

    return new Observable<BuilderOutput>((observer) => {
        buildPromise.then(({success}) => {
            copy(options.copy);
            // only run the node server if the build was successfull
            if (success) {
                let pid = runNodeServer(context, options);
                if (pid !== undefined) return observer.next({success: true});

                return observer.next({success: false});
            }

            // end the observer and publish that it was not successful
            if (!success) {
                observer.next({success: false});
                observer.complete();
            }
        });
    });
});

export default buildFunc;

function runNodeServer(context: BuilderContext, options: Options) {
    // setting the node env option by default it's production
    let NODE_ENV = options.NODE_ENV || 'production';

    let child = childProcess.spawn(
        'env',
        [
            `NODE_ENV=${NODE_ENV}`,
            'node',
            '-r',
            'tsconfig-paths/register',
            '-r',
            'ts-node/register',
            `${context.currentDirectory}/${options.mainInOutput}`,
        ],
        { stdio: 'pipe' },
    );

    child.stdout.on('data', (data: Buffer) => context.logger.info(Buffer.from(data).toString('utf8')));
    child.stderr.on('data', (data: Buffer) => child.stdout.emit('data', data));

    return child.pid;
}

async function buildOnlyMode(context: BuilderContext, options: Options): Promise<BuilderOutput> {
    let tscResult = spawnTSC(context, options);

    context.logger.info(Buffer.from(tscResult.stdout).toString('utf8'));

    if (tscResult.status === 0) {
        context.logger.info('Typescript compiled successfully');
    }

    return { success: tscResult.status === 0 };
}

function spawnTSC(context: BuilderContext, options: Options) {
    return childProcess.spawnSync('tsc', ['--build', `${context.currentDirectory}/${options.tsconfig}`, '--pretty']);
}
