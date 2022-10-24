import { IFunction } from "../../lib/services/function/interfaces/function.interface";

export interface IFunctionTreeNode extends IFunction {
  Level?: number;
  Expand?: boolean;
  Parent?: IFunctionTreeNode;
}
