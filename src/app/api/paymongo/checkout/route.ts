import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, description, paymentMethod } = body;

        const secretKey = process.env.PAYMONGO_SECRET_KEY;
        if (!secretKey) {
            console.error("❌ PAYMONGO_SECRET_KEY is missing via process.env");
            return NextResponse.json({ error: "Server configuration error: Payment key missing." }, { status: 500 });
        }

        // PayMongo amount is in centavos (e.g. 100 PHP = 10000)
        const amountInCents = Math.round(amount * 100);

        // Determine allowed payment methods based on user selection
        let allowedPaymentMethods = ['card', 'gcash', 'paymaya', 'grab_pay']; // Default fallback
        
        if (paymentMethod === 'card') {
            allowedPaymentMethods = ['card'];
        } else if (paymentMethod === 'gcash') {
            allowedPaymentMethods = ['gcash', 'paymaya', 'grab_pay'];
        }

        // Checkout Session API handles both GCash and Cards via a hosted page
        const sessionOptions = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                authorization: `Basic ${Buffer.from(secretKey).toString('base64')}`
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        line_items: [
                            {
                                currency: 'PHP',
                                amount: amountInCents,
                                description: description || 'Order Payment',
                                name: 'RJ Music Order',
                                quantity: 1,
                                images: ['https://www.rjmusic.shop/logo.png'] 
                            }
                        ],
                        payment_method_types: allowedPaymentMethods,
                        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rjmusic.shop'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rjmusic.shop'}/checkout`
                    }
                }
            })
        };

        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', sessionOptions);
        const data = await response.json();

        if (data.errors) {
            console.error('PayMongo Error:', data.errors);
            return NextResponse.json({ error: data.errors[0].detail }, { status: 400 });
        }

        return NextResponse.json({ 
            checkoutUrl: data.data.attributes.checkout_url,
            sessionId: data.data.id
        });

    } catch (error: unknown) {
        console.error('Checkout API Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed" }, { status: 500 });
    }
}
