// src/lib/billing.ts
import { supabase } from "./supabaseClient";

export type PlanName = "free" | "pro";

export const FREE_DAILY_UPLOAD_LIMIT = 3; // 👈 change to 2 if you want

export type UploadStatus = {
  plan: PlanName;
  uploadsToday: number;
  remainingToday: number | null; // null = unlimited
};

async function getOrCreateProfile(userId: string): Promise<UploadStatus> {
  // 1) Try to fetch existing profile
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const today = new Date();
  const todayDateString = today.toISOString().slice(0, 10); // YYYY-MM-DD

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile", error);
    throw error;
  }

  if (!data) {
    // 2) No profile yet → create default "free" profile
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        plan: "free",
        uploads_today: 0,
        uploads_reset_at: todayDateString,
      })
      .select("*")
      .single();

    if (insertError || !inserted) {
      console.error("Error creating profile", insertError);
      throw insertError;
    }

    return {
      plan: inserted.plan as PlanName,
      uploadsToday: inserted.uploads_today ?? 0,
      remainingToday: FREE_DAILY_UPLOAD_LIMIT,
    };
  }

  // 3) Existing profile → maybe reset daily counter
  let { plan, uploads_today, uploads_reset_at } = data;

  if (uploads_reset_at !== todayDateString) {
    uploads_today = 0;
    const { error: resetError } = await supabase
      .from("profiles")
      .update({
        uploads_today,
        uploads_reset_at: todayDateString,
      })
      .eq("id", userId);

    if (resetError) {
      console.error("Error resetting daily uploads", resetError);
    }
  }

  const isPro = plan === "pro";

  return {
    plan: plan as PlanName,
    uploadsToday: uploads_today ?? 0,
    remainingToday: isPro
      ? null
      : Math.max(FREE_DAILY_UPLOAD_LIMIT - (uploads_today ?? 0), 0),
  };
}

/** Check if the user is allowed to upload right now */
export async function getUploadStatus(userId: string): Promise<UploadStatus> {
  return getOrCreateProfile(userId);
}

/** Increment uploads_today after a successful upload and return updated status */
export async function recordUpload(userId: string): Promise<UploadStatus> {
  const status = await getOrCreateProfile(userId);

  const todayDateString = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("profiles")
    .update({
      uploads_today: status.uploadsToday + 1,
      uploads_reset_at: todayDateString,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error recording upload", error);
    throw error;
  }

  // Return fresh status so App.tsx can update the banner / state
  return getOrCreateProfile(userId);
}
