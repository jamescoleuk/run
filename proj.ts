// Dog-fooding

import { Op, process } from "https://deno.land/x/proj@v0.2.0/mod.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";

const { args } = Deno;

const root: Op = {
  name: "",
  help:
    "Usage: \t\t\tdeno run -A run.ts [OPTIONS] COMMAND\nUsage (compiled): \trun [OPTIONS] COMMAND\n",
  nodes: [
    {
      name: "test",
      help: "Run the tests",
      func: async () => await exec("deno test --allow-run"),
    },
    {
      name: "compile",
      help: "Select a file to compile",
      nodes: [
        {
          name: "example",
          help: "The config in example/run.ts",
          func: async () =>
            await exec("deno compile --unstable example/run.ts"),
        },
        {
          name: "this",
          help: "This project script",
          func: async () => {
            await exec("mkdir -p build");
            await exec("deno compile --unstable --output build/proj proj.ts");
          },
        },
      ],
    },
  ],
};

process(root, args);
