import * as cpx from 'cpx'
import {CopyInput} from "../types";

export function copy(copyInputs: CopyInput[]) {
    console.log('copying inputs', copyInputs);
    copyInputs.forEach((input) => cpx.copySync(`${input.path}${input.glob}`, `dist/out-tsc/${input.path}`));
}
