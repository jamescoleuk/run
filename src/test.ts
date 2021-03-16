import {
  assert,
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std/testing/asserts.ts";

import { exec } from "./deps.ts";

import { getCommand, Op, Result, Status } from "./mod.ts";

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
          func: async () => await exec("echo 'build service 2'"),
          help: "build service 2 help",
        },
        {
          name: "service1",
          func: async () => await exec("./scripts/ops/do_a_thing.sh"),
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

Deno.test({
  name: "1st level command",
  async fn(): Promise<void> {
    const response: Result = await getCommand(root, ["build"], 0);
    assertEquals(Status.NotExecutable, response.status);
    if (root.nodes && root.nodes.length > 0) {
      const node = root.nodes[0];
      assertEquals(response.node.name, node.name);
      assertEquals(response.node.help, node.help);
      assertEquals(response.node.nodes?.length, node.nodes?.length);
    } else {
      assert(false);
    }
  },
});

Deno.test({
  name: "2nd level command",
  async fn(): Promise<void> {
    const response = await getCommand(root, ["build", "service1"], 0);
    assertEquals(Status.FoundCommand, response.status);
    assertEquals(response.node.name, "service1");
    assertEquals(response.node.help, "build service 1 help");
    assertEquals(response.node.nodes, undefined);
    assertNotEquals(response.node.func, undefined);
  },
});

Deno.test({
  name: "bad command",
  async fn(): Promise<void> {
    const response = await getCommand(root, ["build", "BAD COMMAND"], 0);
    assertEquals(Status.InvalidCommand, response.status);
    assertEquals("BAD COMMAND", response.badCommand);
  },
});
