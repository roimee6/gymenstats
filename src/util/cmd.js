export default async function (content, config) {
    const args = content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    try {
        const module = await import("../cmd/" + command + ".js");
        await module.run(config, args);
    } catch (e) {
        console.log(e);
        console.log(`Command '${command}' not found`);
    }
}