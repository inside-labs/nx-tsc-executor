import {JsonObject} from "@angular-devkit/core";

export type CopyInput = {
    path: string;
    glob: string;
};

export interface Options extends JsonObject {
    /**
     * @description this is the main file to run the output path
     */
    mainInOutput: string;

    /**
     * @description tsconfig.json path
     */
    tsconfig: string;

    /**
     * @description this is an option that will run the node server
     * after building if false it will only build
     */
    runAndBuild: boolean;

    /**
     * @description if you want to set the node env
     * @default production
     */
    NODE_ENV: string;

    /**
     * @description this is flag in which the project is already built but we want to
     * just run
     * @default false
     */
    // runOnly: boolean;

    /**
     * @description optional glob copy command usually will be used for assests , and stuff
     * that should be copied to the build destination
     */
    copy: CopyInput[];

    /**
     * @description optional a list of directories to delete before building
     */
    clean: string[];
}

