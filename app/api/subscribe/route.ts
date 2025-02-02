import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email, consent } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  if (!consent) {
    return NextResponse.json({ error: "Consent is required" }, { status: 400 })
  }

  const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
  const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX
  const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER_PREFIX || !MAILCHIMP_LIST_ID) {
    return NextResponse.json({ error: "Mailchimp configuration is missing" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `auth ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: "subscribed",
        }),
      },
    )

    const data = await response.json()

    if (response.status >= 400) {
      return NextResponse.json({ error: data.detail }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
