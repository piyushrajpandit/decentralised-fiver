import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding demo task...");

    // Create or reuse a demo user
    let user = await prisma.user.findFirst({
        where: { address: "DEMO_USER_ADDRESS" }
    });

    if (!user) {
        user = await prisma.user.create({
            data: { address: "DEMO_USER_ADDRESS" }
        });
        console.log("✅ Created demo user, id:", user.id);
    } else {
        console.log("ℹ️  Demo user already exists, id:", user.id);
    }

    // Check if demo task already exists
    const existingTask = await prisma.task.findFirst({
        where: {
            signature: "DEMO_SEED_TASK",
            user_id: user.id
        },
        include: { options: true }
    });

    if (existingTask) {
        console.log("\n✅ Demo task already exists!");
        console.log("   Task ID:", existingTask.id);
        console.log("   Title:", existingTask.title);
        console.log(`   👉 View at: http://localhost:3000/task/${existingTask.id}`);
        await prisma.$disconnect();
        return;
    }

    // Create the demo task with sample public images
    const task = await prisma.task.create({
        data: {
            title: "Which thumbnail would you click? (Demo Task)",
            amount: 100000, // 0.1 SOL in lamports
            signature: "DEMO_SEED_TASK",
            user_id: user.id,
            options: {
                createMany: {
                    data: [
                        {
                            image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png"
                        },
                        {
                            image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bikesgray.jpg/320px-Bikesgray.jpg"
                        },
                        {
                            image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg"
                        }
                    ]
                }
            }
        },
        include: { options: true }
    });

    console.log("\n🎉 Demo task created successfully!");
    console.log("   Task ID:", task.id);
    console.log("   Title:", task.title);
    console.log("   Options:", task.options.length);
    console.log(`\n   👉 View at: http://localhost:3000/task/${task.id}`);
    console.log(`   📋 Share this link with your teacher to show the task result page!`);

    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
