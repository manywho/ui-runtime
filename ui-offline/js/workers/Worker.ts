import { executeMacro } from '../services/macros/MacroExecution';

 
const ctx: Worker = self as any;

ctx.onmessage = (e) => {
    const parsedResponse = JSON.parse(e.data);
    let macroResult;
    try {
        macroResult = executeMacro(
            `function(state){ ${parsedResponse.macro}}`,
            parsedResponse.metadata,
            parsedResponse.state,
        );
    } catch (error) {
        ctx.postMessage({ error: error.message });
    }

    ctx.postMessage(macroResult);
};
