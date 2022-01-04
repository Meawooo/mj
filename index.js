//----------Running the bot on WebServer----------//
const express = require('express');
const app = express();
const port = 3000;
app.get('/', (req, res) => res.send('Bot is running on Discord Server'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
//----------Important Packages----------//
const { Client, Collection, Constants } = require("discord.js");
const Discord = require("discord.js");
const client = new Discord.Client()
const pagination = require('discord.js-pagination');
const {
    token,
    prefix,
    ServerID
} = require("./config.json")
const activities = [
    "with ARAAN SHEIKH",
    "with commands",
    "[prefix]help",
    "with wumpus"
  ];
Constants.DefaultOptions.ws.properties.$browser = 'Discord Android'
//----------Bot Starts Here----------//

  client.on("ready", () => {
    console.log("Success - Bot is running")
setInterval(() => {
    const randomIndex = Math.floor(Math.random() * (activities.length - 1) + 1);
    const newActivity = activities[randomIndex];

    client.user.setActivity(newActivity);
    }, 5000);
})
client.on("channelDelete", (channel) => {
    if (channel.parentID == channel.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)
        if (!person) return;

        let deleteembed = new Discord.MessageEmbed()
            .setAuthor("Ticket Deleted", client.user.displayAvatarURL())
            .setColor('RANDOM')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription("Your ticket was deleted by an Admin or a Moderator, if you wish to open another ticket, Send a message here !")
        return person.send(deleteembed)
    }
})
client.on("message", async message => {
    if (message.author.bot) return;
    let args = message.content.slice(prefix.length).split(' ');
    let command = args.shift().toLowerCase();
    if (message.guild) {
        if (command == "setup") {
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("ERR :x: - You can\'t use this command")
            }
            if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("ERR :x: - Unable to use this command, Please give me Administrator")
            }
            let role = message.guild.roles.cache.find((x) => x.name == "HELPER")
            let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

            if (!role) {
                role = await message.guild.roles.create({
                    data: {
                        name: "HELPER",
                        color: "GREEN"
                    },
                    reason: "Role required for ModMail System, anyone with this role will be able to reply to tickets"
                })
            }
            await message.guild.channels.create("MODMAIL", {
                type: "category",
                topic: "All the tickets will show up here",
                permissionOverwrites: [{
                        id: role.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    },
                    {
                        id: everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    }
                ]
            })
            return message.channel.send("Success ✔️ - Setup has Completed\n ⚠️ ModMail System is now active")
        } else if (command == "close") {
            if (message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {
                const person = message.guild.members.cache.get(message.channel.name)
                if (!person) {
                    return message.channel.send("ERR :x: - Unable to close this ticket either because the channel for the ticket has been modified or does not exist anymore")
                }
                await message.channel.delete()
                let closeembed = new Discord.MessageEmbed()
                    .setAuthor("Ticket Closed", client.user.displayAvatarURL())
                    .setColor("RANDOM")
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter("Ticket was closed by " + message.author.username)
                if (args[0]) closeembed.setDescription(args.join(" "))
                return person.send(closeembed)
            }
        } else if (command == "help") {
            const how = new Discord.MessageEmbed()
        .setTitle('How to use ModMail')
        .setDescription('To open a ticket, just DM the ModMail bot ( Me ) and moderators will shortly reply to your ticket')
        .setColor('RANDOM')
        .setTimestamp()
        const com = new Discord.MessageEmbed()
        .setTitle('Commands')
        .addField('`help`', 'Help Desk ( This Command )')
        .addField('`setup`', 'Use this command to start the ModMail System')
        .addField('`close`', 'Close a Ticket')
        .setColor('RANDOM')
        .setTimestamp()
        const about = new Discord.MessageEmbed()
        .setTitle('FAQ')
        .addField('`How to use commands`', 'to use a command, type [prefix] [command name]')
        .addField('`Why are there bugs in this bot`', 'This bot is currently in beta mode, if you come across a bug, please report the bug to the bot dev')
        .addField('`Who is the bot dev`', 'ARAAN SHEIKH is the owner of this bot, 875768640320962650 <= ID')
        .addField('`How do i report a bug`', 'It is simple, just message the bug to this ID => 875768640320962650')
        .setColor('RANDOM')
        .setTimestamp()
        const pages = [
            how,
            com,
            about
    ]

    const emojiList = ["⏪", "⏩"];

    const timeout = '120000';

    pagination(message, pages, emojiList, timeout)
        }
    }
    if (message.channel.parentID) {
        const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")
        if(!category) return;
        if (message.channel.parentID == category.id) {
            let member = message.guild.members.cache.get(message.channel.name)
            if (!member) return message.channel.send('ERR :x: - Unable To Send Message')
            let errembed = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setFooter(message.author.username, message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setDescription(message.content)
            return member.send(errembed)
        }
    }
    if (!message.guild) {
        const guild = await client.guilds.cache.get(ServerID) || await client.guilds.fetch(ServerID).catch(m => {})
        if (!guild) return;
        const category = guild.channels.cache.find((x) => x.name == "MODMAIL")
        if (!category) return;
        const main = guild.channels.cache.find((x) => x.name == message.author.id)
        if (!main) {
            let mx = await guild.channels.create(message.author.id, {
                type: "text",
                parent: category.id,
                topic: "This ticket was created for helping  **" + message.author.tag + " **"
            })
            let openembed = new Discord.MessageEmbed()
                .setAuthor("Ticket Opened")
                .setColor("RANDOM")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("Ticket is now open, Please type your question/problem here and a moderator / admin will reply to you shortly, Thank you")
            message.author.send(openembed)
            let eembed = new Discord.MessageEmbed()
                .setAuthor("Ticket", message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setColor("RANDOM")
                .setThumbnail(message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setDescription(message.content)
                .addField("Name", message.author.username)
                .addField("This Account was created on", message.author.createdAt)
            return mx.send(eembed)
        }
        let tagembed = new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setFooter(message.author.tag, message.author.displayAvatarURL({
                dynamic: true
            }))
            .setDescription(message.content)
        main.send(tagembed)
    }
})
client.login(token)

//----------Bot Ends Here----------//
