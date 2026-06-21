import updateStatus from "@/app/actions/statusFormat";

export async function GET() {
  try {
    const result = await updateStatus();

    return Response.json({
      success: true,
      result,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: "Cron failed" },
      { status: 500 }
    );
  }
}