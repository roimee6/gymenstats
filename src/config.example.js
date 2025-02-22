// noinspection JSUnusedGlobalSymbols
export default {
    fotmob: {
        /*

        The id of the league your team plays in
        53 = ligue1

        To find the id go to the league page on fotmob
        Exemple: https://www.fotmob.com/fr/leagues/53/overview/ligue-1
        The id is between “/leagues/” and “/overview/

        */
        ligueId: 53,

        /*

        The id of the soccer club to be managed by the site
        9831 = ogcnice

        To retrieve the id go to your club's fotmob page
        Exemple: https://www.fotmob.com/fr/teams/9831/overview/nice
        The id is between “/teams/” and “/overview/

         */
        clubId: 9831,

        /*

        The site only includes goals from matches in official
        competitions and does not include friendly matches.

        My code just needs the friendly matches id
        Don't change the id unless you want your site to include friendly matches too

         */
        friendliesId: 489
    },
    cloud: {
        // Read more in the readme
        discord: {
            token: "", // Discord bot token
            guildId: "", // The guild id
            channelId: "" // The channel id
        }
    },
    server: {
        port: 3333 // Website port
    },
    twitter: {
        cookie: "" // Cookies from the twitter account, which will allow you to install twitter videos for the site.
    },
    debug: true
}