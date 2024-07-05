const mineflayer = require("mineflayer");
const pathfinder = require("mineflayer-pathfinder").pathfinder;
const Movements = require("mineflayer-pathfinder").Movements;
const { GoalNear } = require("mineflayer-pathfinder").goals;

class MCBot {
  constructor(server, port, username) {
    this.server = server;
    this.port = port;
    this.username = username;

    this.init();
  }

  init() {
    this.bot = mineflayer.createBot({
      server: this.server,
      port: this.port,
      username: this.username
    });


  }
}

function botInit() {
  bot = mineflayer.createBot({
    host: "Opt_293.aternos.me",
    port: 50365,
    username: "sigma",
  });

  
  bot.loadPlugin(pathfinder);
}
botInit()

let defaultMove = null;

async function afk() {
  bot.setControlState("jump", false);
  setTimeout(() => {bot.setControlState("jump", true)}, 1000)
  setTimeout(afk, 3000);
}

bot.on("login", () => {
  defaultMove = new Movements(bot);
  afk();
  bot.setControlState("right", true);
  setTimeout(() => {
    bot.chat(`sigma bot is on and jumping at ${bot.entity.position.floor()}`);
    bot.chat(`to make me leave, whisper "leave" to me.`);
  }, 200);
});

bot.on("whisper", (username, msg, rawMsg) => {
  if (
    msg.trim().toLowerCase().includes("leave") ||
    msg.trim().toLowerCase().includes("quit") ||
    msg.trim().toLowerCase().includes("exit") ||
    msg.trim().toLowerCase().includes("kys") &&
    username === "slashed"
  ) {
    bot.whisper(username, "ok");
    bot.quit();
    //process.exit();
  }
});

bot.on("chat", async (user, msg) => {
  if (user === bot.username) return;
  const split = msg.split(" ");
  const command = split.shift();
  const args = split;

  if (command === "bed") {
    bot.chat("Attempting to search for a bed...");
    const block = bot.findBlock({
      matching: (block) => bot.isABed(block),
    });
    if (block) {
      bot.pathfinder.setMovements(defaultMove);
      bot.pathfinder.setGoal(new GoalNear(block.position.x, block.position.y, block.position.z, 1));

      try {
        await bot.sleep(block);
        await bot.activateBlock(block);
      } catch (err) {
        bot.chat(`whoopsies: ${err}`);
      }
    } else {
      bot.chat("No bed found, im staying at my position.");
    }
  }

  if (command === "move" && args.length) {
    let goal = null;
    if (args.length > 0 && args.length < 2) {
      if (args[0] == "me") {
        goal = new GoalNear(
          bot.players[user].entity.position.x,
          bot.players[user].entity.position.y,
          bot.players[user].entity.position.z,
          1
        );
      } else if (bot.players[args[0]]) {
        goal = new GoalNear(
          bot.players[args[0]].entity.position.x,
          bot.players[args[0]].entity.position.y,
          bot.players[args[0]].entity.position.z,
          1
        );
      } else {
        return bot.chat(
          "invalid arguments: move [player] OR move me OR move [coords]"
        );
      }
    } else if (args.length > 2) {
      goal = new GoalNear(args[0], args[1], args[2], 1);
    } else {
      return bot.chat(
        "invalid arguments: move [player] OR move me OR move [coords]"
      );
    }

    bot.chat(`ok, pathfinding to ${goal.x} ${goal.y} ${goal.z}`);
    bot.pathfinder.setMovements(defaultMove);
    bot.pathfinder.setGoal(goal);
  }

  if (command === "drop") {
    const items = bot.inventory.items();
    for (let i = 0; i < items.length; i++) {
      await bot.tossStack(items[i]);
    }
  }
});

bot.on("death", () => {
  bot.respawn();
  bot.chat("fucking kys stop killing me and move me back to the afk spot");
});

bot.on("end", () => {
  setTimeout(() => {}, 5000)
  botInit()
})