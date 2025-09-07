import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  console.log("🚀 STARTING /api/points/get");
  
  try {
    console.log("1️⃣ Calling auth()...");
    const session = await auth();
    console.log("2️⃣ Auth result:", session ? "✅ Found session" : "❌ No session");
    
    if (!session?.user?.email) {
      console.log("3️⃣ No session or email, returning 401");
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 401 }
      );
    }

    console.log("4️⃣ Session email:", session.user.email);
    console.log("5️⃣ Querying database...");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { points: true, id: true, email: true }
    });

    console.log("6️⃣ Database query result:", user ? "✅ User found" : "❌ User not found");
    
    if (!user) {
      console.log("7️⃣ User not found, returning 404");
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("8️⃣ User data:", { id: user.id, email: user.email, points: user.points });
    console.log("9️⃣ Returning success response");

    return NextResponse.json({
      points: user.points || 0
    });

  } catch (error) {
    console.error("💥 ERROR in /api/points/get:");
    console.error("Error type:", typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json(
      { error: "Failed to get points" },
      { status: 500 }
    );
  } finally {
    console.log("🔚 Disconnecting Prisma...");
    try {
      await prisma.$disconnect();
      console.log("✅ Prisma disconnected successfully");
    } catch (disconnectError) {
      console.error("❌ Error disconnecting Prisma:", disconnectError);
    }
    console.log("🏁 FINISHED /api/points/get");
  }
}