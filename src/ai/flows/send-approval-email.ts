
'use server';

/**
 * @fileOverview Implements a Genkit flow to send a purchase order approval email.
 *
 * - sendApprovalEmail - A function that handles the email sending process.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as nodemailer from 'nodemailer';

// Define the schema and type locally within this file.
// This avoids exporting non-function objects from a "use server" file.
const SendApprovalEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  orderId: z.string().describe('The ID of the purchase order to approve.'),
  orderNumber: z.string().describe('The number of the purchase order.'),
  orderAmount: z.number().describe('The total amount of the purchase order.'),
  approvalUrl: z.string().url().describe('The secure URL to approve the purchase order.'),
  orderDate: z.string().describe("The date the order was created in ISO format."),
});

type SendApprovalEmailInput = z.infer<typeof SendApprovalEmailInputSchema>;

const sendEmailTool = ai.defineTool(
    {
      name: 'sendEmail',
      description: 'Sends an email to the specified recipient using the configured SMTP server.',
      inputSchema: z.object({
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        error: z.string().optional(),
      }),
    },
    async ({to, subject, body}) => {
       const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

       console.log("Attempting to send email with credentials:", {
            user: GMAIL_USER,
            hasPassword: !!GMAIL_APP_PASSWORD
       });

       if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            const errorMsg = "Gmail credentials are not configured in environment variables.";
            console.error(errorMsg);
            return { success: false, error: errorMsg };
       }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"OrderFlow" <${GMAIL_USER}>`,
        to: to,
        subject: subject,
        html: body,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`);
        return { success: true };
      } catch (error: any) {
        console.error(`❌ Failed to send email:`, error);
        return { success: false, error: error.message };
      }
    }
);

const sendApprovalEmailFlow = ai.defineFlow(
  {
    name: 'sendApprovalEmailFlow',
    inputSchema: SendApprovalEmailInputSchema,
    outputSchema: z.object({
        success: z.boolean(),
        error: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      console.log("Executing direct email flow with input:", input);
      
      const subject = `Solicitud de Aprobación: Orden de Compra ${input.orderNumber}`;
      
      const body = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Solicitud de Aprobación de Orden de Compra</h2>
          <p>Hola,</p>
          <p>Se ha generado una nueva orden de compra que requiere tu aprobación:</p>
          <ul>
            <li><strong>Número de Orden:</strong> ${input.orderNumber}</li>
            <li><strong>Importe Total:</strong> ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(input.orderAmount)}</li>
            <li><strong>Fecha del Pedido:</strong> ${new Date(input.orderDate).toLocaleDateString('es-ES')}</li>
          </ul>
          <p>Por favor, revisa los detalles y aprueba la orden haciendo clic en el siguiente botón:</p>
          <a href="${input.approvalUrl}" style="background-color: #1a73e8; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Aprobar Orden de Compra
          </a>
          <p style="font-size: 12px; color: #888; margin-top: 20px;">
            Si no puedes ver el botón, copia y pega esta URL en tu navegador: ${input.approvalUrl}
          </p>
        </div>
      `;

      // Call the tool directly instead of going through a prompt
      const result = await sendEmailTool({
        to: input.to,
        subject,
        body
      });
      
      return result;

    } catch (error) {
       console.error("Error in sendApprovalEmailFlow:", error);
       return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      };
    }
  }
);

export async function sendApprovalEmail(input: SendApprovalEmailInput): Promise<{ success: boolean; error?: string }> {
    return sendApprovalEmailFlow(input);
}
