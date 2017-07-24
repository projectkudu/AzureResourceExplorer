import {PsCmdType} from "./PSCmdType";

export interface RMCommandInfo {
    cmd: PsCmdType;
    isAction: boolean;
    isSetAction: boolean;
}