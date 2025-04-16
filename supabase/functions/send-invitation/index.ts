
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getSupabaseClient } from "../_shared/supabase-client.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const TEST_MODE = true; // Set this to true for development, false for production
const RESEND_VERIFIED_EMAIL = "trypie.test1@gmail.com"; // The email you verified with Resend

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  groupId: string;
  groupName: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, groupId, groupName, inviterName }: InvitationRequest = await req.json();
    const supabase = getSupabaseClient(req);

    // Generate a unique token for the invitation
    const token = crypto.randomUUID();
    
    // Create a URL for the invitation link
    const baseUrl = req.headers.get("origin") || "https://trypie-app.vercel.app";
    const inviteUrl = `${baseUrl}/groups/invitation?token=${token}`;

    // Extract user ID from JWT token
    const authHeader = req.headers.get('Authorization') || '';
    let invitedBy = null;
    
    if (authHeader.startsWith('Bearer ')) {
      const jwt = authHeader.substring(7);
      try {
        // Parse the JWT payload
        const base64Payload = jwt.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        invitedBy = payload.sub; // This is the user ID
      } catch (e) {
        console.error("Failed to parse JWT:", e);
      }
    }
    
    // Store the invitation in the database
    const { data, error: dbError } = await supabase
      .from('group_invitations')
      .insert({
        group_id: groupId,
        email: email,
        token: token,
        invited_by: invitedBy,
        status: 'pending'
      })
      .select();

    if (dbError) {
      console.error("Error storing invitation:", dbError);
      throw new Error(`Failed to store invitation: ${JSON.stringify(dbError)}`);
    }

    let emailSent = false;
    let emailResponse;

    // Determine recipient email based on test mode
    const recipientEmail = TEST_MODE ? RESEND_VERIFIED_EMAIL : email;

    // Send the email invitation
    emailResponse = await resend.emails.send({
      from: "Trypie Travel <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `You're invited to join ${groupName} on Trypie!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6366F1; color: white; padding: 20px; text-align: center;">
            <h1>Trypie Travel Invitation</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #eaeaea; border-top: none; background: white;">
            <p>Hello!</p>
            <p>${inviterName} has invited you to join their travel group "${groupName}" on Trypie.</p>
            <p>Trypie is an AI-powered travel app that helps you plan and coordinate trips with friends.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background-color: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Join the Group
              </a>
            </div>
            <p style="color: #666;">This invitation link will expire in 7 days.</p>
            <p style="color: #666;">If you can't click the button, copy and paste this URL into your browser: ${inviteUrl}</p>
            ${TEST_MODE && email !== RESEND_VERIFIED_EMAIL ? 
              `<p style="color: red; font-weight: bold;">NOTE: This is a test email. In development mode, all emails are sent to ${RESEND_VERIFIED_EMAIL} instead of the actual recipient (${email}).</p>` : ''}
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2025 Trypie. All rights reserved.</p>
          </div>
        </div>
      `
    });

    // Check if there was an error with Resend
    if (emailResponse.error) {
      console.error("Error from Resend:", emailResponse.error);
      
      // Store this information in the response but don't throw an error
      // The invitation is still created, just not delivered via email
      emailSent = false;
    } else {
      console.log("Email sent successfully to:", recipientEmail);
      emailSent = true;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      token,
      emailSent,
      recipientEmail,
      actualEmail: email,
      testMode: TEST_MODE,
      emailError: emailResponse.error ? emailResponse.error.message : null
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
