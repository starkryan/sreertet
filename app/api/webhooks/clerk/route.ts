import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client with service role for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Get the headers - headers() needs to be awaited in newer Next.js versions
    const headersList = await Promise.resolve(headers());
    const svix_id = headersList.get('svix-id');
    const svix_timestamp = headersList.get('svix-timestamp');
    const svix_signature = headersList.get('svix-signature');

    // If there are no Svix headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new NextResponse('Error: Missing Svix headers', {
        status: 400
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // This is your webhook signing secret from your Clerk Dashboard
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      return new NextResponse('Error: Missing webhook secret', {
        status: 500
      });
    }

    // Using the Svix library to validate the webhook
    const wh = new Webhook(WEBHOOK_SECRET);
    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    }) as { type: string; data: any };

    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      
      const primaryEmail = email_addresses?.[0]?.email_address || '';

      // Save user to Supabase with default balance
      const { error } = await supabase
        .from('clerk_users')
        .insert({
          clerk_id: id,
          email: primaryEmail,
          first_name: first_name || '',
          last_name: last_name || '',
          avatar_url: image_url || '',
          balance: 0, // Default balance for new users
        });

      if (error) {
        console.error('Error saving user to Supabase:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to save user' }), {
          status: 500
        });
      }

      return new NextResponse(JSON.stringify({ message: 'User created successfully' }), {
        status: 200
      });
    }

    return new NextResponse(JSON.stringify({ message: 'Webhook received' }), {
      status: 200
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse(JSON.stringify({ error: 'Webhook verification failed' }), {
      status: 400
    });
  }
}

export async function GET() {
  return new NextResponse('Webhook endpoint is working', {
    status: 200
  });
} 