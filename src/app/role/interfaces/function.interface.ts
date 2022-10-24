import { IFunction } from "src/app/lib/services/function/interfaces/function.interface";

export interface IFunctionView extends IFunction {
  checked: boolean;
  FunctionChilds?: IFunctionView[];
}
