/**
 * Dev-only seed. Replaces the known seed rows (does not wipe unrelated data).
 * Usage: bun run db:seed
 */
import { inArray } from "drizzle-orm";

import { db } from "./schema";
import { clubs } from "./schema/club";
import { clubMembers } from "./schema/clubMember";
import { events } from "./schema/event";
import { fests } from "./schema/fest";
import { institutes } from "./schema/institute";
import { users, type NewUser } from "./schema/user";
import { extraDetailsSchema } from "./schema/userExtraDetails";

const INSTITUTE_ID = "seed_institute_nitr";
const FEST_ID = "seed_fest_innovision";
const CLUB_TECH_ID = "seed_club_technical";
const CLUB_CULT_ID = "seed_club_cultural";

const EVENT_IDS = [
    "seed_event_hackathon",
    "seed_event_robotics",
    "seed_event_quiz",
    "seed_event_dance",
    "seed_event_music",
] as const;

const USER_IDS = Array.from(
    { length: 10 },
    (_, i) => `seed_user_${String(i + 1).padStart(2, "0")}`
);

const CLUB_MEMBER_IDS = ["seed_club_member_01", "seed_club_member_02"] as const;

async function seed() {
    await db
        .delete(clubMembers)
        .where(inArray(clubMembers.id, [...CLUB_MEMBER_IDS]));
    await db.delete(events).where(inArray(events.id, [...EVENT_IDS]));
    await db.delete(users).where(inArray(users.id, USER_IDS));
    await db
        .delete(clubs)
        .where(inArray(clubs.id, [CLUB_TECH_ID, CLUB_CULT_ID]));
    await db.delete(fests).where(inArray(fests.id, [FEST_ID]));
    await db.delete(institutes).where(inArray(institutes.id, [INSTITUTE_ID]));

    await db.insert(institutes).values({
        id: INSTITUTE_ID,
        name: "NIT Rourkela",
        description: "National Institute of Technology, Rourkela",
        address: "Rourkela, Odisha",
        collegeStatus: "ALLOWED",
    });

    await db.insert(fests).values({
        id: FEST_ID,
        name: "Innovision",
        tagline: "Ideate. Innovate. Inspire.",
        description: "Annual techno-cultural fest (seed data)",
        startDate: new Date("2026-11-06T00:00:00Z"),
        endDate: new Date("2026-11-08T23:59:59Z"),
        status: "ACTIVE",
        registrationFee: 500,
        collegeStatus: "ALLOWED",
        society: ["Technical Society", "Cultural Society"],
    });

    await db.insert(clubs).values([
        {
            id: CLUB_TECH_ID,
            name: "Technical Club",
            subType: "TECHNICAL",
            description: "Engineering and technology events",
        },
        {
            id: CLUB_CULT_ID,
            name: "Cultural Club",
            subType: "CULTURAL",
            description: "Dance, music, and literary events",
        },
    ]);

    const seedUsers: NewUser[] = USER_IDS.map((id, index) => {
        const n = index + 1;
        const padded = String(n).padStart(2, "0");
        return {
            id,
            email: `seed.user${padded}@xangoes.dev`,
            name: `Seed User ${padded}`,
            gender: n % 3 === 0 ? "OTHERS" : n % 2 === 0 ? "FEMALE" : "MALE",
            state: "odisha",
            city: "rourkela",
            college: INSTITUTE_ID,
            mobile: `90000000${padded}`,
            festID: FEST_ID,
            rollNumber: `SEED${padded}`,
            firebaseId: `seed_firebase_${padded}`,
            extraDetails:
                n <= 3
                    ? extraDetailsSchema.parse({
                          stream: "CSE",
                          referredBy: "seed_ca",
                      })
                    : undefined,
        };
    });
    await db.insert(users).values(seedUsers);

    const eventStart = new Date("2026-11-06T09:00:00Z");
    const eventEnd = new Date("2026-11-07T18:00:00Z");

    await db.insert(events).values([
        {
            id: EVENT_IDS[0],
            name: "Overnight Hackathon",
            subHeading: "Build something in 24 hours",
            type: "HACKATHON",
            description: "Team hackathon for the technical club.",
            poster: "https://example.com/posters/hackathon.png",
            rules: ["Teams of 2-4", "Original work only"],
            location: "SAC Hall",
            startDate: eventStart,
            endDate: eventEnd,
            clubId: CLUB_TECH_ID,
            contact: ["9000000001"],
            pocID: [USER_IDS[0]],
            status: "ACTIVE",
            priority: 1,
        },
        {
            id: EVENT_IDS[1],
            name: "Robotics Challenge",
            description: "Line-follower and arena robotics.",
            poster: "https://example.com/posters/robotics.png",
            rules: ["Open to all colleges"],
            location: "LA-101",
            startDate: eventStart,
            endDate: eventEnd,
            clubId: CLUB_TECH_ID,
            contact: ["9000000002"],
            pocID: [USER_IDS[1]],
            status: "ACTIVE",
            priority: 2,
        },
        {
            id: EVENT_IDS[2],
            name: "Tech Quiz",
            description: "General and CS quiz.",
            poster: "https://example.com/posters/quiz.png",
            rules: ["Teams of 2"],
            location: "BBA Auditorium",
            startDate: eventStart,
            endDate: eventEnd,
            clubId: CLUB_TECH_ID,
            contact: ["9000000003"],
            pocID: [USER_IDS[2]],
            status: "DRAFT",
            priority: 3,
        },
        {
            id: EVENT_IDS[3],
            name: "Group Dance",
            description: "Cultural group dance competition.",
            poster: "https://example.com/posters/dance.png",
            rules: ["5-12 members per team"],
            location: "Open Air Theatre",
            startDate: eventStart,
            endDate: eventEnd,
            clubId: CLUB_CULT_ID,
            contact: ["9000000004"],
            pocID: [USER_IDS[3]],
            status: "ACTIVE",
            priority: 1,
        },
        {
            id: EVENT_IDS[4],
            name: "Battle of Bands",
            description: "Live music competition.",
            poster: "https://example.com/posters/music.png",
            rules: ["Original or covers allowed"],
            location: "DTS Stage",
            startDate: eventStart,
            endDate: eventEnd,
            clubId: CLUB_CULT_ID,
            contact: ["9000000005"],
            pocID: [USER_IDS[4]],
            status: "ACTIVE",
            priority: 2,
        },
    ]);

    await db.insert(clubMembers).values([
        {
            id: CLUB_MEMBER_IDS[0],
            clubID: CLUB_TECH_ID,
            userID: USER_IDS[0],
            role: "LEAD",
        },
        {
            id: CLUB_MEMBER_IDS[1],
            clubID: CLUB_CULT_ID,
            userID: USER_IDS[3],
            role: "COORDINATOR",
        },
    ]);

    console.log("Seed complete:", {
        fests: 1,
        clubs: 2,
        events: 5,
        users: 10,
        institutes: 1,
        clubMembers: 2,
    });
}

seed()
    .then(async () => {
        process.exit(0);
    })
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    });
