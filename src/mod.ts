import { Colors, parse } from "./deps.ts";
import { log } from "./logging.ts";

/** This defines an operation. Construct your tree from this type. */
export interface Op {
  name: string;
  help: string;
  func?(params?: FuncParam[]): void;
  funcParams?: FuncParam[];
  nodes?: Op[];
}

export interface FuncParam {
  long: String;
  short: String;
  help: String;
  value?: String;
}

// TODO: I'm only exporting this for testing. Rewire for deno?
export enum Status {
  FoundCommand,
  InvalidCommand,
  NotExecutable,
}

// TODO: I'm only exporting this for testing. Rewire for deno?
export interface Result {
  node: Op;
  status: Status;
  badCommand?: string;
  params?: FuncParam[];
}

/** Shows help for a particular operation. */
function showHelp(op: Op) {
  log.header(op.name);
  log.info(op.help);
  if (op.nodes) {
    log.info("Commands:");
    op.nodes.forEach((node) => {
      const nameLength = 15;
      const remaining = nameLength - node.name.length - 2;
      console.log( `  ${Colors.green(node.name)}${" ".repeat(remaining)}${node.help}`);
      // Print out help for the params
      node.funcParams?.forEach((funcParam) => {
        const param = `${funcParam.short}/${funcParam.long}`
        const frontSpace = '     ';
        console.log(
          `     ${Colors.yellow(param)}`
        );
        console.log(`          ${funcParam.help}`)
      })
      console.log("")
    });
  }
}

/** Determines the operation for the arguments and depth. */
// TODO: I'm only exporting this for testing. Rewire for deno?
export async function getCommand(
  op: Op,
  pathSpec: string[],
  depth: number,
): Promise<Result> {
  if (op.nodes) {
    if (pathSpec.length === depth) {
      // We've reached the limit of our path spec and there are still more nodes
      // So we're going to infer that this command isn't executable and we will
      // display help.
      return { node: op, status: Status.NotExecutable };
    } else {
      // Let's see if we can find what the user asked for.
      const nodeMatches: Op[] = op.nodes.filter((node) =>
        node.name == pathSpec[depth]
      );

      if (nodeMatches.length === 0) {
        // We couldn't find the user's command, so we're going to let them know they
        // typed something wrong.
        return {
          node: op,
          status: Status.InvalidCommand, badCommand: pathSpec[depth], }; 
        } 
        else if (nodeMatches.length > 1) {
                      throw new Error(
          "Found duplicate names! This is a bug in the node config.",
        );
      } else {
        /// We're going to keep looking down the nodes.
        return await getCommand(nodeMatches[0], pathSpec, depth + 1);
      }
    }
  } else if (op.func) {
    // We found the command and we're going to return that.
    // But first we need to validate the params, if there are any.
    const incomingParams = pathSpec.slice(depth);
    const params = [];
    for(var i = 0; i < incomingParams.length; i++){
      // Such for loop, wow. For neater incrementing.
      if(incomingParams[i].includes("-")){
        const actualParam = op.funcParams?.find(param => 
          param.long.startsWith(incomingParams[i]) || param.short.startsWith(incomingParams[i]));
        if(actualParam){
          i++;
          actualParam.value = incomingParams[i];
          params.push(actualParam);
        }
        else {
          log.error(`I'm afraid ${incomingParams[i]} isn't a valid parameter.`)  ;
        }
        // console.log(`actual: ${actualParam.toString()}`)
      }
    }

    // TODO: We also need to check if all the mandatory params, if there are any, are supplied.
    return { node: op, status: Status.FoundCommand, params };
  } else {
    throw new Error(
      "Looks like this operation has neither a function or a set of children defined.",
    );
  }
}

/** Processes an operation tree against some arguments. */
export async function process(root: Op, args: string[]) {
  const result = await getCommand(root, args, 0);
  // We're going to handle the Result based on the Status.
  switch (result.status) {
    case Status.FoundCommand:
      if (result.node.func) {
        await result.node.func(result.params);
      } else throw new Error("Expected a valid command but found none.");
      break;
    case Status.InvalidCommand:
      if (result.badCommand) {
        log.error(
          `I'm afraid ${
            Colors.yellow(result.badCommand)
          } isn't a valid option!`,
        );
      } else throw new Error("Expecting a bad command but found none.");
      showHelp(result.node);
      break;
    case Status.NotExecutable:
      showHelp(result.node);
      break;
  }
}
