import * as cpx from 'cpx'
import {CopyInput} from "../types";

export function copy(copyInputs: CopyInput[]) {
    copyInputs.forEach((input) => cpx.copySync(`${input.path}${input.glob}`, `dist/out-tsc/${input.path}`));
}
