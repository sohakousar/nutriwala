import { createTransport } from "npm:nodemailer@6.9.10";

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string;
  is_subscription?: boolean;
}

interface OrderDetails {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  discountAmount?: number;
}

export const sendOrderConfirmationEmail = async (order: OrderDetails) => {
  const SMTP_HOST = Deno.env.get("SMTP_HOST");
  const SMTP_PORT = Deno.env.get("SMTP_PORT");
  const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME");
  const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
  const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL");

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USERNAME || !SMTP_PASSWORD) {
    console.error("SMTP credentials not set. Skipping email sending.");
    return { success: false, error: "Missing SMTP Credentials" };
  }

  const transporter = createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: parseInt(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD,
    },
  });

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; width: 72px;">
        ${item.product_image
          ? `<img src="${item.product_image}" alt="${item.product_name}" width="64" height="64" style="width: 64px; height: 64px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb; display: block;">`
          : `<div style="width: 64px; height: 64px; background-color: #f9fafb; border-radius: 4px; border: 1px solid #e5e7eb; text-align: center; line-height: 64px; font-size: 24px;">&#128230;</div>`
        }
      </td>
      <td style="padding: 12px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
        <p style="margin: 0; font-weight: 700; color: #111827; font-size: 14px; line-height: 1.4;">${item.product_name}</p>
        <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">Qty: ${item.quantity}</p>
        ${item.is_subscription ? `<span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; margin-top: 4px; text-transform: uppercase;">Subscription</span>` : ''}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; text-align: right; white-space: nowrap;">
        <p style="margin: 0; font-weight: 600; color: #111827; font-size: 14px;">&#8377;${item.total_price.toFixed(0)}</p>
      </td>
    </tr>
        `
    )
    .join("");

  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation</title>
        <!--[if mso]>
        <style type="text/css">
            body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
        </style>
        <![endif]-->
        <style type="text/css">
            @media only screen and (max-width: 600px) {
                .email-container { width: 100% !important; }
                .content-padding { padding: 20px !important; }
                .info-cell { display: block !important; width: 100% !important; padding-bottom: 16px !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F0F4F1; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

        <!-- Outer wrapper table -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F0F4F1;">
            <tr>
                <td align="center" style="padding: 24px 16px;">

                    <!-- Email container -->
                    <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">

                        <!-- Header -->
                        <tr>
                            <td style="background-color: #166534; padding: 32px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-family: Georgia, serif; font-size: 30px; font-weight: 700; font-style: italic; letter-spacing: -0.5px;">Nutriwala</h1>
                            </td>
                        </tr>

                        <!-- Greeting -->
                        <tr>
                            <td class="content-padding" style="padding: 40px 32px 32px; text-align: center; border-bottom: 3px solid #e8f0e8;">
                                <table role="presentation" width="64" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 16px;">
                                    <tr>
                                        <td style="width: 64px; height: 64px; background-color: #e8f0e8; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 28px; color: #166534;">&#10003;</td>
                                    </tr>
                                </table>
                                <h2 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 24px; font-weight: 700; color: #111827;">Order Confirmed!</h2>
                                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                    Thank you for shopping with us, <strong style="color: #111827;">${order.customerName}</strong>.<br>Your organic goodies are being picked and will be on their way shortly.
                                </p>
                            </td>
                        </tr>

                        <!-- Info Grid -->
                        <tr>
                            <td class="content-padding" style="padding: 28px 32px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td class="info-cell" style="width: 50%; padding-bottom: 20px; vertical-align: top;">
                                            <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Order #</p>
                                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${order.orderNumber}</p>
                                        </td>
                                        <td class="info-cell" style="width: 50%; padding-bottom: 20px; vertical-align: top;">
                                            <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${formattedDate}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="info-cell" style="width: 50%; vertical-align: top;">
                                            <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Payment</p>
                                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${order.paymentMethod}</p>
                                        </td>
                                        <td class="info-cell" style="width: 50%; vertical-align: top;">
                                            <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Email</p>
                                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827; word-break: break-all;">${order.customerEmail}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Items Header -->
                        <tr>
                            <td style="padding: 0 32px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="border-top: 1px solid #e5e7eb; padding-top: 8px; text-align: center;">
                                            <p style="margin: 0; font-family: Georgia, serif; color: #166534; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Items Ordered</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Items List -->
                        <tr>
                            <td class="content-padding" style="padding: 16px 32px 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    ${itemsHtml}
                                </table>
                            </td>
                        </tr>

                        <!-- Order Summary Header -->
                        <tr>
                            <td style="background-color: #f0f4f1; padding: 10px 32px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0; font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Order Summary</p>
                            </td>
                        </tr>

                        <!-- Order Summary Content -->
                        <tr>
                            <td class="content-padding" style="padding: 20px 32px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    ${order.discountAmount ? `
                                    <tr>
                                        <td style="padding-bottom: 8px; font-size: 14px; color: #6b7280;">Subtotal</td>
                                        <td style="padding-bottom: 8px; font-size: 14px; font-weight: 500; color: #111827; text-align: right;">&#8377;${(order.totalAmount + order.discountAmount).toFixed(0)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 12px; font-size: 14px; color: #166534; font-weight: 500;">Discount</td>
                                        <td style="padding-bottom: 12px; font-size: 14px; font-weight: 500; color: #166534; text-align: right;">-&#8377;${order.discountAmount.toFixed(0)}</td>
                                    </tr>
                                    ` : ''}
                                    <tr>
                                        <td style="padding-top: 12px; border-top: 1px solid #e5e7eb; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #111827;">Grand Total</td>
                                        <td style="padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 22px; font-weight: 700; color: #166534; text-align: right;">&#8377;${order.totalAmount.toFixed(0)}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Shipping Address -->
                        <tr>
                            <td class="content-padding" style="padding: 0 32px 28px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f4f1; border-left: 4px solid #166534; border-radius: 2px;">
                                    <tr>
                                        <td style="padding: 16px; width: 32px; vertical-align: top; font-size: 18px;">&#128666;</td>
                                        <td style="padding: 16px 16px 16px 0; vertical-align: top;">
                                            <p style="margin: 0 0 6px; font-size: 10px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 1px;">Shipping To</p>
                                            <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                                                ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}<br>
                                                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- CTA Button -->
                        <tr>
                            <td class="content-padding" style="padding: 0 32px 36px; text-align: center;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td align="center" style="background-color: #166534; border-radius: 4px;">
                                            <a href="https://nutriwala.vercel.app/orders" target="_blank" style="display: block; padding: 16px 32px; color: #ffffff; font-weight: 600; text-decoration: none; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">
                                                View Order Details
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 28px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 12px; font-size: 12px; color: #9ca3af;">
                                    Need help? <a href="mailto:support@nutriwala.com" style="color: #166534; font-weight: 500; text-decoration: underline;">Contact Support</a>
                                </p>
                                <p style="margin: 0; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; line-height: 1.6;">
                                    &copy; ${new Date().getFullYear()} Nutriwala Inc.<br>
                                    Premium Dry Fruits &amp; Healthy Snacks
                                </p>
                            </td>
                        </tr>

                    </table>
                    <!-- End email container -->

                </td>
            </tr>
        </table>
        <!-- End outer wrapper -->

    </body>
    </html>
    `;

  try {
    const info = await transporter.sendMail({
      from: `Nutriwala Orders <${SENDER_EMAIL || SMTP_USERNAME}>`,
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: html,
    });

    console.log("Email sent successfully:", info);
    return { success: true, data: info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};
