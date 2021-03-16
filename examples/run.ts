import { Op, process, FuncParam } from "../src/mod.ts";
import { exec } from "https://deno.land/x/exec/mod.ts";

const { args } = Deno;

const root: Op = {
  name: "",
  help:
    "Usage: \t\t\tdeno run -A run.ts [OPTIONS] COMMAND\nUsage (compiled): \trun [OPTIONS] COMMAND\n",
  nodes: [
    {
      name: "build",
      help: "Build services",
      nodes: [
        {
          name: "service2",
          func: async (params: FuncParam[]) => {
            await exec("echo 'build service 2'");
            params.forEach(param => {
              if(param.short.startsWith("-p")) console.log(`You wanted ${param.value} ponk(s)`);
              if(param.short.startsWith("-f")) console.log("You wanted a foobar");
              if(param.short.startsWith("-t")) console.log("You wanted a tonk");
            });
          },
          help: "build service 2 help",
          funcParams: [
            {
              short: "-f",
              long: "--foobar",
              help: "Builds service 2 with extra foobar"
            },
            {
              short: "-t",
              long: "--tonk",
              help: "Build the service 2 and make it 'tonk'."
            },
            {
              short: "-p <noOfTimes>",
              long: "--ponk <noOfTimes>",
              help: "Build the service 2 and make it 'ponk' the specified number of times."
            }

          ]
        },
        {
          name: "service1",
          func: async () => await exec("./examples/do_a_thing.sh"),
          help: "build service 1 help",
        },
      ],
    },
    {
      name: "tests",
      help: "Run tests",
      nodes: [
        {
          name: "service2",
          func: () => exec("echo 'build service 2'"),
          help: "build service 2 help",
        },
        {
          name: "service1",
          func: () => exec("echo 'build service 1'"),
          help: "build service 1 help",
        },
      ],
    },
    {
      name: "release",
      help: "Release services and software",
      nodes: [
        {
          name: "service2",
          func: () => exec("echo 'build service 2'"),
          help: "build service 2 help",
        },
        {
          name: "service1",
          func: () => exec("echo 'build service 1'"),
          help: "build service 1 help",
        },
      ],
    },
  ],
};

process(root, args);
