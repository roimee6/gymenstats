import Fotmob from "@max-xoo/fotmob";
import axios from "axios";

import {existsSync, mkdirSync, writeFileSync} from "fs";

export default async function (config) {
    console.log(`[🏁] Starting cache for club ${config.fotmob.clubId}`);

    const fotmob = new Fotmob();

    const cache = {
        goals: [],
        matches: [],
        composition: []
    };

    console.log(`[📋] Fetching team information`);

    const team = await fotmob.getTeam(config.fotmob.clubId);
    const fixtures = team.fixtures.allFixtures.fixtures;

    for (const player of team.overview.lastLineupStats.starters) {
        cache.composition.push({
            id: player.id,
            isCaptain: player.isCaptain,
            lastName: player.lastName,
            shirtNumber: player.shirtNumber,
            positionId: player.positionId
        });
    }

    let lastMatch = false;
    let numberI = -1;

    for (const fixture of fixtures) {
        if (fixture.status.finished && fixture.tournament.leagueId !== config.fotmob.friendliesId) {
            const matchId = fixture.id;

            lastMatch = matchId;

            const details = await fotmob.getMatchDetails(matchId);
            const home = fixture.home.id === config.fotmob.clubId;

            const players = home ? details.header.events.homeTeamGoals : details.header.events.awayTeamGoals;
            const goalsTotal = home ? fixture.home.score : fixture.away.score;

            console.log(`[🥅] Match against ${fixture.opponent.name}: ${fixture.status.scoreStr}`);

            for (const player of Object.values(players)) {
                for (const goal of player) {
                    cache.goals.push({
                        date: fixture.status.utcTime,
                        time: goal.time,
                        id: goal.eventId,
                        opponent: fixture.opponent.name,
                        opponentId: fixture.opponent.id,
                        home: home,
                        tournament: fixture.tournament.name,
                        tournamentId: fixture.tournament.leagueId,
                        finalScore: fixture.status.scoreStr,
                        clubScore: goalsTotal,
                        opponentScore: fixture.opponent.score,
                        stadium: details.content.matchFacts.infoBox.Stadium.name,
                        win: fixture.result,
                        player: goal.lastName,
                        playerId: goal.player.id,
                        assist: goal.assistInput,
                        assistId: goal.assistPlayerId,
                    });
                }
            }
        }
    }

    cache.goals.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateA - dateB !== 0) {
            return dateA - dateB;
        }

        return a.time - b.time;
    });

    let currentNumber = 1;

    cache.goals.forEach((goal) => {
        goal.number = currentNumber;
        currentNumber++;
    });

    for (const fixture of fixtures) {
        const matchId = fixture.id;

        if (matchId === lastMatch || (numberI !== -1)) {
            numberI++;

            const home = fixture.home.id === config.fotmob.clubId;
            const goalsTotal = home ? fixture.home.score : fixture.away.score;

            cache.matches.push({
                finished: fixture.status.finished,
                matchId: matchId,
                home: fixture.home.name,
                homeId: fixture.home.id,
                away: fixture.away.name,
                awayId: fixture.away.id,
                tournament: fixture.tournament.name,
                tournamentId: fixture.tournament.leagueId,
                finalScore: fixture.status.scoreStr,
                clubScore: goalsTotal,
                opponentScore: fixture.opponent.score,
                win: fixture.result,
                date: fixture.status.utcTime,
            });
        }
    }

    await downloadImgs(cache);

    console.log(`[🏁] Cache completed\n\n\n`);
    return cache;
}

async function downloadImgs(cache) {
    const playerDir = "./public/cdn/players/";
    const leagueDir = "./public/cdn/leagues/";
    const teamsDir = "./public/cdn/teams/";

    mkdirSync(playerDir, {recursive: true});
    mkdirSync(leagueDir, {recursive: true});
    mkdirSync(teamsDir, {recursive: true});

    for (const player of cache.composition) {
        const playerId = player.id;
        const playerPath = playerDir + playerId + ".png";

        if (!existsSync(playerPath)) {
            console.log(`[⬇️] Downloading player image: ${player.lastName}`);
            writeFileSync(playerPath, await downloadImg(playerId, "player"));
        }
    }

    for (const goal of cache.goals) {
        const opponentId = goal.opponentId;
        const tournamentId = goal.tournamentId;
        const playerId = goal.playerId;
        const assistId = goal.assistId;

        const opponentPath = teamsDir + opponentId + ".png";
        const tournamentPath = leagueDir + tournamentId + ".png";
        const playerPath = playerDir + playerId + ".png";
        const assistPath = playerDir + assistId + ".png";

        if (!existsSync(opponentPath)) {
            console.log(`[⬇️] Downloading team logo: ${goal.opponent}`);
            writeFileSync(opponentPath, await downloadImg(opponentId, "team"));
        }
        if (!existsSync(tournamentPath)) {
            console.log(`[⬇️] Downloading tournament logo: ${goal.tournament}`);
            writeFileSync(tournamentPath, await downloadImg(tournamentId, "tournament"));
        }
        if (!existsSync(playerPath)) {
            console.log(`[⬇️] Downloading player image: ${goal.player}`);
            writeFileSync(playerPath, await downloadImg(playerId, "player"));
        }
        if (!existsSync(assistPath) && assistId) {
            console.log(`[⬇️] Downloading assist player image: ${goal.assist}`);
            writeFileSync(assistPath, await downloadImg(assistId, "player"));
        }
    }

    for (const match of cache.matches) {
        const homeId = match.homeId;
        const awayId = match.awayId;
        const tournamentId = match.tournamentId;

        const homePath = teamsDir + homeId + ".png";
        const awayPath = teamsDir + awayId + ".png";
        const tournamentPath = leagueDir + tournamentId + ".png";

        if (!existsSync(homePath)) {
            console.log(`[⬇️] Downloading home team logo: ${match.home}`);
            writeFileSync(homePath, await downloadImg(homeId, "team"));
        }
        if (!existsSync(awayPath)) {
            console.log(`[⬇️] Downloading away team logo: ${match.away}`);
            writeFileSync(awayPath, await downloadImg(awayId, "team"));
        }
        if (!existsSync(tournamentPath)) {
            console.log(`[⬇️] Downloading tournament logo: ${match.tournament}`);
            writeFileSync(tournamentPath, await downloadImg(tournamentId, "tournament"));
        }
    }
}

async function downloadImg(id, type) {
    let url;

    switch (type) {
        case "player":
            url = `https://images.fotmob.com/image_resources/playerimages/${id}.png`;
            break;
        case "tournament":
            url = `https://images.fotmob.com/image_resources/logo/leaguelogo/${id}.png`;
            break;
        case "team":
            url = `https://images.fotmob.com/image_resources/logo/teamlogo/${id}.png`;
            break;
    }

    try {
        const res = await axios.get(url, {responseType: "arraybuffer"});
        return res.data;
    } catch (e) {
        console.log(`[❌] Download error ${url}: ${e.message}`);
        return false;
    }
}