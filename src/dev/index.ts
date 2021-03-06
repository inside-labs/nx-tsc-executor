import {BuilderContext, BuilderOutput, createBuilder} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';
import {Observable} from 'rxjs';
import * as shell from 'shelljs';
import './schema.json'

export interface Options extends JsonObject {
    /**
     * @description this is the main file to run in the output path
     */
    mainInOutput: string;

    /**
     * @description tsconfig.json path
     */
    tsconfig: string;

    /**
     * @description array file paths to make nodemon watch (optional)
     */
    watch: string[];

    /**
     * @description if you want to set the node env
     * @default development
     */
    NODE_ENV: string;

    /**
     * @description this is the delay in seconds which is passed to nodemon it's measured in seconds
     * ex: 1 , 2 or 2000ms or 1.5 = 1500ms
     * @default 1.5 seconds
     */
    delayBetweenRestarts: number;

    /**
     * @description this is a flag to run the process in debug mode
     * @default false
     */
    debug: boolean;

    /**
     * @description this is the debug port it's 9229 by default
     */
    debugPort: number;

}

let buildFunc = createBuilder<Options>((options, context): Promise<BuilderOutput> | Observable<BuilderOutput> => {
    return new Observable<BuilderOutput>((observer) => {
        try {
            concurrentlyRun(context, options).then(() => {
                observer.next({success: true});
            });
        } catch (err) {
            observer.next({success: false});
            observer.complete();
        }
    });
});

export default buildFunc;

async function concurrentlyRun(context: BuilderContext, options: Options) {
    let NODE_ENV = options.NODE_ENV || 'development';

    shell.exec(
        `TS_NODE_PROJECT=${options.tsconfig} NODE_ENV=${NODE_ENV} ts-node -r tsconfig-paths/register ${context.currentDirectory}/${options.mainInOutput}`,
    );
}

