
'use server';

/**
 * @fileOverview Implements a Genkit flow to send a purchase order approval email.
 *
 * - sendApprovalEmail - A function that handles the email sending process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as nodemailer from 'nodemailer';
import type { SendApprovalEmailInput } from '@/app/purchasing/actions';
import { SendApprovalEmailInputSchema } from '@/app/purchasing/actions';


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
        html: body, // Use HTML to allow for links and buttons
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
  
const emailPrompt = ai.definePrompt({
    name: 'sendApprovalEmailPrompt',
    input: { schema: SendApprovalEmailInputSchema },
    tools: [sendEmailTool],
    prompt: `You are an assistant responsible for sending purchase order approval emails.
  
      Generate a clear and professional HTML email to the recipient ({{to}}) to inform them about a new purchase order that requires their approval.
      
      The email subject must be: "Solicitud de Aprobación: Orden de Compra {{orderNumber}}".
      
      The email body must be professional, in Spanish, and include:
      - A brief introductory sentence.
      - The purchase order number: {{orderNumber}}.
      - The total amount of the order: {{orderAmount}} EUR.
      - A clear call to action with a styled button linking to the approval URL: {{approvalUrl}}. 
      
      The button must be an HTML anchor tag styled to look like a button. It must have the text "Aprobar Orden de Compra".

      Use the sendEmail tool to send the generated email.`,
});

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
    const result = await emailPrompt(input);
    const toolResponse = result.toolRequest?.toolResponse;
    if (toolResponse?.output) {
        return toolResponse.output;
    }
    return { success: false, error: "No se pudo obtener respuesta de la herramienta de envío." };
  }
);


export async function sendApprovalEmail(input: SendApprovalEmailInput): Promise<{ success: boolean, error?: string }> {
    return sendApprovalEmailFlow(input);
}
